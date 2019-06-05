export const clientID = process.env.CLIENT_ID;
export const clientSecret = process.env.CLIENT_SECRET;

/*

*/
function rand() {
	return Math.floor(Math.random() * 1000);
}

/*

*/
function parseRedirectFragment(fragment) {
	var values = {};	
	fragment.split(/&/).forEach(function(pair) {
		var nameval = pair.split(/=/);
		values[nameval[0]] = nameval[1];
	});
		
	return values;
}

/*

*/     	
function getAuthorizationToken(code, redirectUri) {
	var params = {
		grant_type: "authorization_code",
    	client_id: clientID,
	    client_secret: clientSecret,
	    code: code,
      redirect_uri: redirectUri
    };
	
	return new Promise((resolve, reject) => {
		$.ajax({
			url:"https://shikimori.one/oauth/token",
		    type:"POST",
		    data: params,
		    dataType:"json"
  		})
		.done((data) => {
			if(data.error === undefined) {
  				localStorage.shikimori_session = JSON.stringify(data);
  				resolve(data);
  			} else
  				reject(new Error(data.error));
       	});
    });
}

/*

*/
export function instance() {
	if(localStorage.shikimori_session === undefined) {
		return new Promise((resolve, reject) => {
			reject(new Error("Cant create instance of api without session token."))
		});
	}
	
	var sessionData = JSON.parse(localStorage.shikimori_session);
	return new Promise((resolve, reject) => {
		request(sessionData.access_token, "/users/whoami/", {}).then(
			user => {
				var api = new ShikimoriAPI(sessionData, user)
				window.sAPI = api;
				resolve(api)
			},
			error => {reject(error)}
		);
	});
}

/*

*/
export function authorize({responseType, redirectUri}) {
	return new Promise((resolve, reject) => {
		if(localStorage.shikimori_session != null) {
			instance().then(api => resolve(api), error => reject(error));
			return;
		}
	
		var redirectRgx = new RegExp(redirectUri + '[#\?](.*)');
		
		var options = {
		    'interactive': true,
		    'url': "https://shikimori.one/oauth/authorize"+
		           '?client_id=' + clientID +
		           '&redirect_uri=' + encodeURIComponent(redirectUri) +
		           '&response_type=' + responseType
       	};
       		
       	chrome.identity.launchWebAuthFlow(options, (Uri) => {
       		if(chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
				return;
			}
			
			var matches = Uri.match(redirectRgx);
			if(matches && matches.length > 1) {
				var values = parseRedirectFragment(matches[1]);
				getAuthorizationToken(values.code, redirectUri).then((data) => {
					instance().then( api => resolve(api) );
				},
				(error) => reject(error));
			} else
				reject(new Error());
		});
	});
};

/*

*/
function refresh(clientID, clientSecret, refreshToken) {
	var params = {
		grant_type: "refresh_token",
		client_id: clientID,
		client_secret: clientSecret,
		refresh_token: refreshToken
	};
	
	return new Promise((resolve, reject) => {
		$.ajax({
			url: "https://shikimori.one/oauth/token",
			type: "POST",
			data: params,
			dataType: "json"
		})
		.done((data) => resolve(data));
	});
}

/*

*/
function request(token, path, params, method, auth) {
	return new Promise((resolve, reject) => {
		method = (method === undefined ? "GET" : method);
		auth = (auth === undefined ? true : auth);
			
		let headers = auth
			? {"Authorization": "Bearer " + token}
			: {};

		headers = Object.assign(headers, {
			'Cache-Control': 'must-revalidate'
		});
			
		params = ['POST', 'PATCH', 'PUT'].indexOf(method) != -1
			? JSON.stringify(params)
			: Object.assign(params, {rand: rand()});
			
		$.ajax({
			url:"https://shikimori.one/api" + path,
			type: method,
			headers: headers,
			contentType: "application/json; charset=utf-8",
			data:params,
			dataType:"json",
			xhrFields: {loadend: ()=>{}}
		}).then(
			(data) => resolve(data),
			(xhr, textStatus, errorThrown) => reject(xhr, errorThrown)
		);
	});
}

/*

*/
export default class ShikimoriAPI {
	constructor( params, currentUser ) {
		this.token = params.access_token;
		this.refreshToken = params.refreshToken;
		this.createdAt = params.created_at;
		this.expriesIn = params.expries_in;
		this.tokenType = params.token_type;
		
		this.currentUser = currentUser;
	}
	
	/*

	*/
	__refresh() {
		return refresh(
			this.clientID,
			this.clientSecret,
			this.refreshToken
		).then((data) => {
			this.expriesIn = data.expriesIn;
			this.createdAt = data.createdAt;
			
			return data;
		})
	}
	
	/*

	*/
	__catchCodes(path, params, method, auth, xhr, errorThrown) {
		// If server returned HTTP Code 429 (Retry later) then repeat the
		// request through 250 ms.
		if(xhr.status == 429) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					this.__request(path, params, method, auth)
						.then(
							(data) => resolve(data),
							(xhr, error) => reject(xhr, error)
						)
					},400)
			});
		}
	}
	
	/*

	*/
	__request(path, params, method, auth) {
		params = params || {};
		
		if(new Date().getTime() >= this.expriesIn) {
			return this.__refresh().then((data) => {
				return this.__request(path, params, method, auth);
			});
		}
		
		return request(
			this.token, path, params, method, auth
		)
		.catch((xhr, errorThrown) => {
			return this.__catchCodes(
				path, params, method, auth, xhr, errorThrown
			);
		});
	}
	
	/*

	*/
	getCurrentUser() {
		return this.currentUser;
	}
	
	/*
	user_id											Must be a number.
	target_id										Must be a number.
	target_type										Must be one of: Anime, Manga.
	status											planned, watching, rewatching, completed, n_hold, dropped
	page											ignored when user_id is set. 1 and 100000.
	limit											1000 maximum. This field is ignored when user_id is set.
													Must be a number between 1 and 100000.
	*/
	getUserRates(params) {
		return this.__request("/v2/user_rates/", params, "GET", true);
	}
	
	/*
	
	*/
	whoame() {
		return this.__request("/users/whoame/", {}, "GET", true);
	}
	
	/*
		limit							count messages for page
		page							page number 1,2,...
	*/
	getDialogs(props) {
		return this.__request("/dialogs/", props, "GET", true);
	}
	
	/*
	
	*/
	deleteDialog(ID) {
		return this.__request("/dialogs/"+ID, {}, "DELETE", true);
	}
	
	/*
		userID							Dialog "to" user id.
		limit							count messages for page
		page							page number 1,2,...
	*/
	getDialogMessages(params) {
		return this.__request("/dialogs/"+params.userID+"/", params, "GET", true);
	}
	
	/*
		messageID						Message id
	*/
	getMessage(messageID) {
		return this.__request("/messages/"+messageID+"/", {}, "GET", true);
	}
	
	/*
		frontend						true|false
		message							object {
											body,
											from_id
											kind,
											to_id
										}
	*/
	addMessage(params) {
		return this.__request("/messages", params, "POST", true);
	}
	
	/*
		ids								mark readed message ids 1,5345,...
		is_read							string "0" or "1"
	*/
	readMessages(params) {
		return this.__request("/messages/mark_read", params, "POST", true);
	}
	
	/*
		page							Number 1...100000
		limit							Number maximum 50
		order							[
										id,
										ranked,
										kind,
										popularity,
										name,
										aired_on,
										episodes,
										status,
										random
										]
		kind							[
										tv,
										movie,
										ova,
										ona,
										special,
										music, 
										tv_13, 
										tv_24, 
										tv_48
										]
		status							[
										anons,
										ongoing,
										released
										]
		season							[
										<season>_<year>,
										<year>_<year>,
										<year>
										]
		score							Minimal anime score
		duration						[S(>10m), D(>30m), F(<30m)]
		rating							[none, g, pg_13, r, r_plus, rx]
		genre							List of genre ids separated by comma
		studio							List of studio ids separated by comma
		franchise						List of franchises separated by comma
		sensored						true|false - false for hentai
		mylist							[
										planned,
										watching,
										rewatching,
										completed,
										on_hold,
										dropped
										]
		ids								List of anime ids separated by comma
		exclude_ids						List of anime ids separated by comma
		search							Search phrase to filter animes by name
	*/
	getAnimes(params) {
		return this.__request("/animes/", params, "GET", true);
	}

	getAnime(ID) {
		return this.__request('/animes/'+ID, {}, "GET");
	}
	
	/*
		page							Number 1...100000
		limit							Number maximum 50
		type							[
											inbox,
											private,
											sent,
											news,
											notifications
										]
	*/
	getUserNotifications(userID, params) {
		return this.__request("/users/"+userID+"/messages", params);
	}
	
	/*
	
	*/
	getUserNotifiesCount(userID) {
		return this.__request("/users/"+userID+"/unread_messages", {});
	}
		
	/*
		page 							Must be a number between 1 and 100000.
		limit							100 maximum
	*/
	getUserHistory(userID, params) {
		return this.__request("/user/"+userID+"/history", params);
	}
	
	/*
	
	*/
	getUserFriends(userID) {
		return this.__request("/users/"+userID+"/friends", {});
	}

	/*
	
	*/
	getCalendar() {
		return this.__request("/api/calendar", {});
	}

	incEpisode(rateID) {
		return this.__request("/v2/user_rates/"+rateID+"/increment", {}, 'POST');
	}

	addRate(params) {
		return this.__request("/v2/user_rates", params, 'POST');
	}

	updateRate(ID, params) {
		return this.__request("/v2/user_rates/"+ID, {user_rate: params}, "PATCH");
	}
}

ShikimoriAPI.isAuth = function() {
	return localStorage.shikimori_session != null;
}

ShikimoriAPI.getInstance = function() {
	return window.sAPI;
}