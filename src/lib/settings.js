import {dispatch, subscribe} from './event';

/*

*/
export function set(name, value) {
	localStorage[name] = JSON.stringify(value);
	dispatch('settingsUpdate', {
		key: name, value
	});
}

export function get(name) {
	return JSON.parse(localStorage[name] || null);
}

export function exists(name) {
	return get(name) != null;
}

/*

*/
export function onStorage(key, callback) {
	subscribe('storage', (e) => {
		if(e.key != key) return;
		callback(e);
	})
}
