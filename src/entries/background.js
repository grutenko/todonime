import ShikimoriAPI, {instance} from "../lib/shikimori-api";
import * as BackgroundAPI from '../lib/background-api';
import {subscribe} from '../lib/event';
import {show} from '../lib/notifications';
import {get} from '../lib/settings';
import 'babel-polyfill';

const INTERVAL = 10000;
var SHOWED_NEWS = [];

BackgroundAPI.start();

chrome.runtime.onInstalled.addListener(() => {
	chrome.tabs.query(
		{currentWindow: true},
		(tabs) => {
	  	tabs.forEach(tab => {
	  		if(tab.url && tab.url.match(/todonime\.space/))
	  			chrome.tabs.executeScript(tab.id, {
	  				code: 'window.location.reload();'
	  			})
	  	});
		}
	)
});

function showNews(notifies) {
	notifies.forEach(({linked, id, html_body}) => {
		show(
			id,
			{
				iconUrl: 'https://shikimori.one/' + (linked.image.x96 || ""),
				title: linked.name,
				message: html_body
			},
			() => window.open(
				"https://shikimori.one" + linked.url
			)
		);
	});

	readNotifies(notifies.map(e => e.id));
	SHOWED_NEWS = SHOWED_NEWS.concat(notifies);
}

function getNews(api) {
	return api.getUserNotifications(
		api.getCurrentUser().id,
		{type: "news"}
	).then(
		news => news.filter(n => !n.read)
	);
}

function getCountNotifies(api, time, handler) {
	let functor = () => {
		api.getUserNotifiesCount(api.getCurrentUser().id)
			.then(data => handler(data));
	};

	functor();
	setInterval(functor, time)
}

function readNotifies(api, IDs) {
	if(IDs.length != 0)
		api.readMessages({
			ids: IDs.join(','), is_read: "1"
		});
}

async function start() {
	const api = await instance();

	getCountNotifies(
		api,
		INTERVAL,
		({news, notifications, messages}) => {
			chrome.browserAction.setBadgeText({
				text: (news + notifications + messages).toString()
			});

			getNews(api).then(news => {
				for(let i in news) {
					if(news[i].kind == 'ongoing'
							&& get('favoirites').indexOf(news.linked.id) != -1)
					{
						showNews([news[i]]);
					}
				}
			})
		}
	);
}

if(ShikimoriAPI.isAuth())
	start();
else
	window.addEventListener("storage", (e) => {
		if(e.key == 'shikimori_session')
				start();
	}, false);
