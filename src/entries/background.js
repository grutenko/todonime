import ShikimoriAPI, {instance} from "../lib/shikimori-api";
import * as BackgroundAPI from '../lib/background-api';
import {subscribe} from '../lib/event';
import {show} from '../lib/notifications';
import 'babel-polyfill';

const INTERVAL = 10000;
var SHOWED_NEWS = [];

BackgroundAPI.start();

chrome.runtime.onInstalled.addListener(() => {
	chrome.tabs.query({currentWindow: true}, (tabs) => {
		var code = 'window.location.reload();';
  	tabs.forEach(tab => {
  		if(tab.url && tab.url.match(/todonime\.space/))
  			chrome.tabs.executeScript(tab.id, {code: code})
  	});
	})
});

function showNews(notifies) {
	notifies.forEach(({linked, id, html_body}) => {
		var image = 'https://shikimori.one/' +(linked.image.x96 || "");
		show(id, {iconUrl: image, title: linked.name,message: html_body},
			() => window.open("https://shikimori.one" + linked.url));
	});

	readNotifies(notifies.map(e => e.id));
	SHOWED_NEWS = SHOWED_NEWS.concat(notifies);
}

function getNews(api) {
	const user = api.getCurrentUser();
	return api.getUserNotifications(user.id, {type: "news"})
		.then( news => news.filter(n => !n.read));
}

function getCountNotifies(api, time, handler) {
	const user = api.getCurrentUser();
	let functor = () => {
		api.getUserNotifiesCount(user.id)
			.then(data => handler(data));
	};

	functor();
	setInterval(functor, time)
}

function readNotifies(api, IDs) {
	if(IDs.length == 0) return;
	api.readMessages({ids: IDs.join(','), is_read: "1"});
}

async function start() {
	const api = await instance();

	getCountNotifies(api, INTERVAL, async (data) => {
		//if(data.news > 0) showNews(await getNews(api));

		chrome.browserAction.setBadgeText({
			text: data.news.toString()
		});
	})
}

if(ShikimoriAPI.isAuth())
	start();
else
	window.onstorage = (e) => {
		if(e.key == 'shikimori_session')
				start();
	};
