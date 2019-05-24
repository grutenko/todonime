import ShikimoriAPI from './shikimori-api';

export const SORT = [
	{code: 'id', name: 'id'},
	{code: 'ranked', name: 'оценка'},
	{code: 'kind', name: 'тип'},
	{code: 'popularity', name: 'популярность'},
	{code: 'name', name: 'имя'},
	{code: 'aired_on', name: 'дата релиза'},
	{code: 'episodes', name: 'количество эпизодов'},
	{code: 'status', name: 'статус'}
];

export const KIND = [
	{code: 'tv', name: 'TV Сериал'},
	{code: 'movie', name: 'фильм'},
	{code: 'ova', name: 'OVA'},
	{code: 'ona', name: 'ONA'},
	{code: 'special', name: 'спешл'},
	{code: 'music', name: 'клип'}
];

export const STATUS = [
	{code: 'anons', name: 'анонс'},
	{code: 'ongoing', name: 'онгоинг'},
	{code: 'released', name: 'релиз'}
];

export const DURATION = [
	{code: 'S', name: '> 10 мин.'},
	{code: 'D', name: '> 30 мин.'},
	{code: 'F', name: '< 30 мин.'}
];

export const RATING = [
	{code: 'none', name: 'Без рейтинга'},
	{code: 'g', name: 'G'},
	{code: 'pg', name: 'PG'},
	{code: 'pg_13', name: 'PG-13'},
	{code: 'r', name: 'R'},
	{code: 'r_plus', name: 'R+'}
];

/*
 * Available keys for filter. See param filter in func. getList.
 */
const FILTER_KEYS = [
	'kind', 'status', 'season', 'score', 'duration',
	'rating', 'genre', 'studio', 'franchise', 'censored',
	'search'
];

/*
 * Deputy for API method getAnimes.
 * 
 * @param list 		string 	Filter for user lists (planned, watching, dropped, etc.). Default planned.
 * @param sort 		string 	Sorting data. Default rating
 * @param filter 	object	Filter data as {<filter-key>: <filter-data>}. Default {}
 * @param limit		int			Count animes on page. Default 20.
 * @param page		int			Current page. Default 1
 *
 * @return Promise
 */
export function getList(list, sort, filter, limit, page, search) {
	list = list || 'planned';
	sort = sort || 'rating';
	filter = filter || {};
	limit = limit || 20;
	page = page || 1;
	search = search || "";

	var api = ShikimoriAPI.getInstance();
	var __animes;

	return api.getAnimes(
		Object.assign(stringifyFilter(filter), {
			mylist: list,
			order: sort,
			limit, page, search
		})
	)
	.then(animes => {
		__animes = animes;
		return api.getUserRates({
			user_id: api.getCurrentUser().id,
			target_type: 'Anime',
			status: list
		})
	})
	.then(rates => {
		return setRates(__animes, rates);
	});
}

export function getDetail(ID) {
	return ShikimoriAPI.getInstance().getAnime(ID);
}


/**
 * Function set user rates data to anime. Add the current wathed series.
 * 
 * @param {array} animes animes from method GET /api/v1/animes
 * @param {array} rates  Current user animes rates from method GET /api/v2/user_rates
 *
 * @return {array}
 */
function setRates(animes, rates) {
	return animes.map(anime => {
		for(let i in rates) {
			let rate = rates[i]
			if(rate.target_id != anime.id) continue;
				
			anime = Object.assign(anime, {
				watched: rate.episodes,
				score: rate.score,
			});
				
			break;
		}
			
		return anime;
	})
}

/*
 * Make Filter strings for API method getAnimes.
 *
 * @param filter 	object	Filter data as {<filter-key>: <filter-data>}. Default {}
 *
 * @return object
 */
function stringifyFilter(filter) {
	var preparedFilter = {};

	Object.keys(filter).forEach(k => {
		if(FILTER_KEYS.indexOf(k) == -1) return;

		preparedFilter[k] = !Array.isArray(filter[k])
				? [filter[k]].join(',')
				: filter[k].join(','); 
	});

	return preparedFilter;
}