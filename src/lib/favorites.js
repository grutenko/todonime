import {dispatch} from './event';

/**
 * Get favorites array from local storage
 * @return {array} array as [anime_ids]
 */
export function get() {
	if(localStorage.favorites == null)
			localStorage.favorites = "[]";
	return JSON.parse(localStorage.favorites);
}

/**
 * Check existing anime id in favorites
 * @param  {integer} id Anime ID
 * @return {bollean}
 */
export function exists(id) {
	return get().indexOf(id) != -1
}

/**
 * Add new anime to favorites and generate event 'favorties'
 * @param {array|integer} ids Array of anime IDs or anime id
 */
export function add(ids) {
	if(!Array.isArray(ids)) ids = [ids];
	let favorites = get();

	for(let i in ids) {
		if(exists(ids[i])) continue;
		favorites.push(ids[i]);
	}
	localStorage.favorites = JSON.stringify(favorites);
	dispatch('favorites', {type: 'add', ids});
}

/**
 * Delete anime from favorites
 * @param  {array|integer} ids Array of anime IDs or anime id
 */
export function unset(ids) {
	if(!Array.isArray(ids)) ids = [ids];
	let favorites = get();

	for(let i in ids) {
		if(!exists(ids[i])) continue;
		favorites.splice(favorites.indexOf(ids[i]), 1);
	}

	localStorage.favorites = JSON.stringify(favorites);
	dispatch('favorites', {type: 'delete', ids});
}