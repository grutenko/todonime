import ShikimoriAPI, {authorize, instance} from './shikimori-api';
import 'babel-polyfill';

const METHODS = {
	'anime.get': async (api, data) => {
		return api.getAnime(data.anime_id);
	},
	'anime.episode.watch': async (api, {rateID, episode}) => {
		return api.updateRate(rateID, {
			episodes: parseInt(episode)
		});
	},
	'anime.episode.isWatched': async (api, {anime_id, episode}) => {
		return api.getAnime(anime_id).then(({user_rate}) => {
			return {
				isWatched: user_rate != null
					&& user_rate.episodes >= episode,
				rateID: user_rate
					? user_rate.id
					: null
			};
		})
	},
	'anime.addRate': async (api, {anime_id, episode}) => {
		return api.addRate({
			status: "watching",
			target_id: anime_id,
			target_type: "Anime",
			user_id: api.getCurrentUser().id,
			episodes: episode
		});
	},
	'user.current': async (api) => {
		return new Promise((resolve, reject) => {
			resolve(api.getCurrentUser());
		});
	},
	'user.auth': async () => {
		return authorize().then(api => {return {auth:true}});
	},
	'event.onTabUpdate': async ({urlMatch}) => {
		return new Promise(resolve => {
			const listener = tabId => {
				chrome.tabs.get(tabId, (tab) => {
					if(tab.url.match(urlMatch)) {
						resolve({updated: true});
						chrome.tabs.onUpdated.removeListener(listener);
					}
				})
			};

			chrome.tabs.onUpdated.addListener(listener);
		});
	}
};

function makeSender(sender, storeID) {
	return response => {
		if(sender.tab != undefined)
			chrome.tabs.sendMessage(sender.tab.id, {response, storeID}, ()=>{});
		else
			chrome.runtime.sendMessage({response, storeID}, ()=>{});
  };
}

function observe(callback) {
	chrome.runtime.onMessage.addListener(function(request, sender) {
   	const {method, data, storeID} = request;
   	callback(method, data, makeSender(sender, storeID));
  });
}

export function start() {
	observe(async (method, data, send) => {
		if(method == 'user.auth') {
			METHODS['user.auth']()
				.then(response => send(response));

			return;
		}

		if(!ShikimoriAPI.isAuth()) return;

		METHODS[method](await instance(), data)
			.then(response => send(response))
	});
}

var store = {};
var listen = false;

export function request(method, data, callback) {
	const storeID = Math.floor(Math.random()*1000);
  chrome.runtime.sendMessage({method, data, storeID});

  onMessage(storeID, callback);
}

export function onMessage(storeID, callback) {
	store[storeID] = callback;

  if(!listen) {
		chrome.runtime.onMessage.addListener((request) => {
			store[request.storeID](request.response);
		});
		listen = true;
  }
}
