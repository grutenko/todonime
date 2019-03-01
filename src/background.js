import * as __API__ from "./model/api";
import * as WS from "./model/webSocketApi";

(function(news) {
	const __INTERVAL__ = 10000;
	const __LIMIT__ = 3;
	var __SHOWED_NEWS__ = [];
	
	var __api = null;
	var watchingAnimes = [];
	
	function checkMyNews(news) {
		for(let i in watchingAnimes)
			if(watchingAnimes[i].anime.id == news.linked.id) return true;
		
		return false;
	}
	
	function showNotifications(notifies) {
		notifies.forEach(notify => {
			let props = {
				type: "basic",
				iconUrl: 'https://shikimori.org/'+notify.linked.image.x96,
				title: notify.linked.name,
				message: notify.html_body
			};
			
			chrome.notifications.create(
				notify.id.toString(),
				props
			);
		});
		
		readNotifies(notifies.map(e => e.id));
		__SHOWED_NEWS__ = __SHOWED_NEWS__.concat(notifies);
	}
	
	function getNews(time, handler) {
		let functor = () => {
			__api.getUserNotifications(__api.getCurrentUser().id, {
				limit: __LIMIT__,
				type: "news"
			}).then(data => handler(data));
		};
		
		functor();
		setInterval(functor, time)
	}
	
	function getCountNotifies(time, handler) {
		let functor = () => {
			__api.getUserNotifiesCount(__api.getCurrentUser().id)
				.then(data => handler(data));
		};
		
		functor();
		setInterval(functor, time)
	}
	
	function readNotifies(IDs) {
		if(IDs.length == 0) return;
		__api.readMessages({
			ids: IDs.join(','),
			read: "1"
		});
	}
	
	function checkReaded(news) {
		for(let i in __SHOWED_NEWS__)
			if(__SHOWED_NEWS__[i].id == news.id) return true;
		
		return false;
	}
	
	__API__.authorize({
		responseType: "code",
		redirectUri: chrome.identity.getRedirectURL('provider_cb')
	}).then(api => {
		__api = api;
		return __api.getUserRates(api.getCurrentUser().id, {
			limit: 5000,
			status: "watching"
		});
	}).then(animes => {
		watchingAnimes = animes;
		getNews(__INTERVAL__, news => {
			let unreadedOngoings = news.filter(n => !n.read && !checkReaded(n));
			showNotifications(unreadedOngoings);
		});
		
		getCountNotifies(__INTERVAL__, data => {
			chrome.browserAction.setBadgeText({
				text: data.messages.toString()
			});
		})
	});
})();
