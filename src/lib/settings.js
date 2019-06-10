import {dispatch, subscribe} from './event';

/*

*/
export function set(name, value) {
	localStorage[name] = JSON.stringify(value);
	dispatch('settingsUpdate');
}

export function get(name) {
	return JSON.parse(localStorage[name] || null);
}

/*

*/
export function onStorage(key, callback) {
	dispatch('storage', (e) => {
		if(e.key != key) return;
		callback(e);
	})
}
