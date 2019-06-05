import * as __API__ from "../lib/shikimori-api";
import * as WS from "../lib/web-socket-api";
import API from "../lib/api";

const __INTERVAL__ = 10000;
const __LIMIT__ = 3;
var __SHOWED_NEWS__ = [];
var __SHOWED_MESS__ = [];
	
var __api = null;
var __cUser = null;

chrome.tabs.onUpdated.addListener(tabId => {
	chrome.tabs.query({active:true,windowType:"normal", currentWindow: true}, (tabs) => {
		if(tabId != tabs[0].id) return;

	  chrome.tabs.sendMessage(tabId, {
	  	response: 'tabUpdated',
	  	storeID: -1
	  });
	})
});

chrome.runtime.onInstalled.addListener(() => {
	chrome.tabs.query({currentWindow: true}, (tabs) => {
		var code = 'window.location.reload();';
  	tabs.forEach(tab => {
  		if(tab.url && tab.url.match(/todonime\.space/))
  			chrome.tabs.executeScript(tab.id, {code: code})
  	});
	})
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
   	const {c, data, storeID} = request;

   	const send = data => {
   		chrome.tabs.sendMessage(sender.tab.id,
   			Object.assign(data, {storeID}), ()=>{});
   	};

   	switch(c) {
   		case 'synchro': synchronize(); break;
   		case 'watched': isWatched(data.anime_id, data.episode, send);break;
   		case 'send-watch': sendWatch(data.anime_id, data.episode, data.rateID, send); break;
   		case 'add-rate': addRate(data.anime_id, data.episode, send); break;
   		case 'get-anime': getAnime(data.anime_id, send); break;
   		case 'whoami': getCurrentUser(send); break;
   	}
  });

function auth() {
	return __API__.authorize({
		responseType: "code",
		redirectUri: chrome.identity.getRedirectURL('provider_cb')
	});
}

function getCurrentUser(send) {
	auth()
		.then(api => send({response: api.getCurrentUser()}));
}

function getAnime(anime_id, send) {
	auth()
		.then(api => api.getAnime(anime_id))
		.then(response => send({anime: response}));
}

function addRate(anime_id, episode, send) {
	auth()
		.then(api => {
			return api.addRate({
				status: "watching",
				target_id: anime_id,
				target_type: "Anime",
				user_id: api.getCurrentUser().id,
				episodes: episode
			});
		})
		.then(response => send({response: true, rateID:response.id}))
}

function synchronize() {
	if(!localStorage.synchronize)
		localStorage.synchronize = true;
}

function sendWatch(anime_id, episode, rateID, send) {
	auth()
	.then(api => api.incEpisode(rateID))
	.then(response => send({response: true, rateID}))
}

function isWatched(anime_id, episode, send) {
	auth()
	.then(api => api.getAnime(anime_id))
	.then(anime => {
		synchronize();
		send({
			response: anime.user_rate != null
				&& anime.user_rate.episodes >= episode,
				rateID: anime.user_rate ? anime.user_rate.id : null
		});
	})
}
	
function showNews(notifies) {
	notifies.forEach(notify => {
		var image = 'https://shikimori.one/'
			+(notify.linked.image !== undefined
				? notify.linked.image.x96
				: "");
		
		showNotify(
			notify.id,
			{
				iconUrl: image,
				title: notify.linked.name,
				message: notify.html_body
			},
			() => window.open(
				"https://shikimori.one" + notify.linked.url
			)
		);
	});
		
	readNotifies(notifies.map(e => e.id));
	__SHOWED_NEWS__ = __SHOWED_NEWS__.concat(notifies);
}

function showMessages(messages) {
	messages.forEach(message => {
		showNotify(message.id, {
			iconUrl: message.from.image.x80,
			title: message.from.nickname,
			message: message.html_body
		})
	});
	__SHOWED_MESS__ = __SHOWED_MESS__.concat(messages);
}

function showNotifies(notifies) {
	
}

function showNotify(ID, props, callback) {	
	chrome.notifications.create(
		ID.toString(),
		Object.assign(props, {
			type: "basic"
		})
	);
	
	chrome.notifications.onClicked.addListener((notifyID) => {
		if(notifyID == ID.toString()) callback();
	})
}
	
function getNews(handler) {
	__api.getUserNotifications(__cUser.id, {
		type: "news"
	})
	.then( news => handler(news.filter(n => !n.read)) );
}

function getMessages(handler) {
	__api.getUserNotifications(__cUser.id, {
		type: "private"
	}).then(messages => {
		handler(
			messages.filter(m => {
				for(let i in __SHOWED_MESS__)
					if(__SHOWED_MESS__[i].id == m.id) return false;
				
				return true;
			})
		);
	});
}

function getNotifications(handler) {
	__api.getUserNotifications(__cUser.id, {
		type: "private"
	}).then(handler);
}
	
function getCountNotifies(time, handler) {
	let functor = () => {
		__api.getUserNotifiesCount(__cUser.id)
			.then(data => handler(data));
	};
		
	functor();
	setInterval(functor, time)
}
	
function readNotifies(IDs) {
	if(IDs.length == 0) return;
	__api.readMessages({
		ids: IDs.join(','),
		is_read: "1"
	});
}
	
__API__.authorize({
	responseType: "code",
	redirectUri: chrome.identity.getRedirectURL('provider_cb')
})
.then(api => {
	__api = api;
	__cUser = api.getCurrentUser();
	
	getCountNotifies(__INTERVAL__, data => {
		if(data.news > 0)
			getNews(news => showNews(news));
		
		if(data.notifications > 0)
			getNotifies(notifies => showNotifies(notifies));
		
		chrome.browserAction.setBadgeText({
			text: data.news.toString()
		});
	})
});
