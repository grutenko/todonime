export const clientID = "b9802c42994f52a5b98aaa7f170886b8863ab49fdd934122ffdb7966ec2207c7";
export const clientSecret = "43c19a22704dfacc8b4b81f1f42720a5a2bda8d933a063f6700f02b7e6590f5e";

function rand() {
	return Math.floor(Math.random() * 1000);
}

function parseRedirectFragment(fragment) {
	var values = {};	
	fragment.split(/&/).forEach(function(pair) {
		var nameval = pair.split(/=/);
		values[nameval[0]] = nameval[1];
	});
		
	return values;
}
       	
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
			url:"https://shikimori.org/oauth/token",
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
				var api = new API(sessionData, user)
				window.sAPI = api;
				resolve(api)
			},
			error => {reject(error)}
		);
	});
}

export function authorize({responseType, redirectUri}) {
	return new Promise((resolve, reject) => {
		if(localStorage.shikimori_session !== undefined) {
			instance().then(api => resolve, error => reject(error));
		}
	
		var redirectRgx = new RegExp(redirectUri + '[#\?](.*)');
		
		var options = {
		    'interactive': true,
		    'url': "https://shikimori.org/oauth/authorize"+
		           '?client_id=' + clientID +
		           '&redirect_uri=' + encodeURIComponent(redirectUri) +
		           '&response_type=' + responseType
       	};
       		
       	chrome.identity.launchWebAuthFlow(options, (Uri) => {
       		if(chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError));
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

function refresh(clientID, clientSecret, refreshToken) {
	var params = {
		grant_type: "refresh_token",
		client_id: clientID,
		client_secret: clientSecret,
		refresh_token: refreshToken
	};
	
	return new Promise((resolve, reject) => {
		$.ajax({
			url: "https://shikimori.org/oauth/token",
			type: "POST",
			data: params,
			dataType: "json"
		})
		.done((data) => resolve(data));
	});
}

function request(token, path, params, method, auth) {
	return new Promise((resolve, reject) => {
		method = (method === undefined ? "GET" : method);
		auth = (auth === undefined ? true : auth);
			
		let headers = auth
			? {"Authorization": "Bearer " + token}
			: {};
			
		params = method == "POST"
			? JSON.stringify(params)
			: Object.assign(params, {rand: rand()});
			
		$.ajax({
			url:"https://shikimori.org/api" + path,
			type: method,
			headers: headers,
			contentType: "application/json; charset=utf-8",
			data:params,
			dataType:"json"
		}).then(
			(data) => resolve(data),
			(xhr, textStatus, errorThrown) => reject(xhr, errorThrown)
		);
	});
}

export default class API {
	constructor( params, currentUser ) {
		this.token = params.access_token;
		this.refreshToken = params.refreshToken;
		this.createdAt = params.created_at;
		this.expriesIn = params.expries_in;
		this.tokenType = params.token_type;
		
		this.currentUser = currentUser;
	}
	
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
	
	__request(path, params, method, auth) {
		if(new Date().getTime() >= this.expriesIn) {
			return this.__refresh().then((data) => {
				return this.__request(
					path,
					params,
					method,
					auth
				);
			});
		}
		
		return request(
			this.token,
			path,
			params,
			method,
			auth
		).catch((xhr, errorThrown) => {
			// If server requrned HTTP Code 429 (Retry later) then repeat the
			// request through 250 ms.
			if(xhr.status == 429) {
				return new Promise((resolve, reject) => {
					setTimeout(() => this.__request(path, params, method, auth)
						.then((data) => resolve(data), (xhr, error) => reject(xhr, error)), 250)
				});
			}
		});
	}
	
	getCurrentUser() {
		return this.currentUser;
	}
	
	getUserRates(params) {
		return this.__request("/v2/user_rates/", params, "GET", true);
	}
	
	whoame() {
		return this.__request("/users/whoame/", {}, "GET", true);
	}
	
	getDialogs() {
		return this.__request("/dialogs/", {}, "GET", true);
	}
	
	getDialogMessages(params) {
		return this.__request("/dialogs/"+params.userID+"/", params, "GET", true);
	}
	
	getMessage(messageID) {
		return this.__request("/messages/"+messageID+"/", {}, "GET", true);
	}
	
	addMessage(params) {
		return this.__request("/messages", params, "POST", true);
	}
	
	readMessages(params) {
		return this.__request("/messages/mark_read", params, "POST", true);
	}
	
	getAnimes(params) {
		return this.__request("/animes/", params, "GET", true);
	}
	
	getUserNotifications(userID, params) {
		return this.__request("/users/"+userID+"/messages", params);
	}
	
	getUserNotifiesCount(userID) {
		return this.__request("/users/"+userID+"/unread_messages", {});
	}
	
	getUserRates(userID, params) {
		return this.__request("/users/"+userID+"/anime_rates", params, "GET", true)
			.then((data) => {
				return new Promise((resolve, reject) => {
					resolve(data.filter(rate => rate.status == params.status));
				});
			});
	}
}

API.isAuth = function() {
	return localStorage.shikimori_session !== undefined;
}

API.getInstance = function() {
	return window.sAPI;
}