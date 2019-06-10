export function shikimoriURLMake(search, sort, filter) {
	const BASE_URL = 'https://shikimori.one/animes';
	const {kind, rating} = filter || {};

	return BASE_URL + (kind ? '/kind/'+kind.join(',') : '')
			+ (rating ? '/rating/'+rating.join(',') : '')
			+ (sort ? '/order-by/'+sort : '')
			+ (search ? '?search='+search : '');
}

export function todonimeURLMake(anime_id, episode, video_id) {
	const BASE_URL = 'https://todonime.space/video/';
	return BASE_URL + anime_id + '/' + episode
			+ (video_id ? '/' + video_id : '');
}
