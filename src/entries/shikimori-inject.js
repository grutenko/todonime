import {request} from '../lib/background-api';
import {todonimeURLMake} from '../lib/url-maker';

function createButtonElement(url) {
	var button = $('<section></section>')
		.addClass('block')
		.addClass('watch-online-block');

	button.html('<a class="play-button" href="'+url+'">'
		+'<img src="https://todonime.space/images/logotype-48x48.png" style="width:24px;height: 24px">'
		+'<span class="play-button-text">Смотреть онлайн</span></a>');
	$('.watch-online-placeholer').html(button);
}

function makeButton(arUrl) {
	request('anime.get', {anime_id: arUrl[1]}, anime => {
		if(status == 'anons') return;

		const {status, episodes_aired, episodes, user_rate} = anime;
		const episode = user_rate
				? ((status == 'ongoing' && user_rate.episodes < episodes_aired)
							|| (status == 'released' && user_rate.episodes < episodes)
						? user_rate.episodes + 1
						: user_rate.episodes)
				: 1;

		createButtonElement(todonimeURLMake(anime.id, episode));
	})
}

function start() {
	var url = location.href.match(/\/+animes\/+[a-z]?(\d+)-([a-z0-9\-]+)/);

	if(url != null) makeButton(url);

	request('event.onTabUpdate',
			{urlMatch: /shikimori\.[org|one]\/+animes\/+[a-z]?(\d+)-([a-z0-9\-]+)/},
			start);
}

start();

