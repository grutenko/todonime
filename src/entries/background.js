import * as __API__ from "../model/api";
import * as WS from "../model/webSocketApi";

const __INTERVAL__ = 10000;
const __LIMIT__ = 3;
var __SHOWED_NEWS__ = [];
var __SHOWED_MESS__ = [];
	
var __api = null;
var __cUser = null;
	
function showNews(notifies) {
	notifies.forEach(notify => {
		var image = 'https://shikimori.org/'
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
				"https://shikimori.org" + notify.linked.url
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
		
		if(data.messages > 0)
			getMessages(messages => showMessages(messages));
		
		if(data.notifications > 0)
			getNotifies(notifies => showNotifies(notifies));
		
		chrome.browserAction.setBadgeText({
			text: data.messages.toString()
		});
	})
});
