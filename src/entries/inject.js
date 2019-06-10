import PNotify from 'pnotify/dist/es/PNotify';
import PNotifyButtons from 'pnotify/dist/es/PNotifyButtons';
import {request} from '../lib/background-api';

function meta(name) {
	const metas = document.getElementsByTagName('meta');

  for (let i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute('name') === name) {
      return metas[i].getAttribute('content');
    }
  }

  return '';
}

request('user.current', {}, response => {
	$('.account').html(
		$('<a class="no-margin" href="https://shikimori.one/'+response.nickname+'">'+
			'<img style="border-radius: 50%;" class="avatar__min" src="'+response.image.x48+'">' +
			'<div class="nickname hide-min">'+response.nickname+'</div>'+
		'</a>')
	);
})

function setWatchButton({isWatched, rateID}) {
	if(isWatched) {
			$(".b-click-watched")
				.addClass('watched')
				.attr('title', 'Серия просмотрена');
		}

		if(rateID)
			$(".b-click-watched")
				.attr('data-rate-id', rateID);
}

function setWatchButtonWithHref(response) {
	PNotify.success({
    text: "Серия отмечена как просмотреная.",
    addClass: 'z-indx-top b-white',
    width: '250px',
    minHeight: '32px'
  });

	setWatchButton(response);
	if(!$('.to-next-episode').attr('href')) {
		alert('нету следующего эпизода');
		return;
	}

	location.href = $('.to-next-episode').attr('href');
}

$(".b-click-watched:not(.watched)").on('click', (e) => {
	if($(e.currentTarget).hasClass('watched')) return;

	if($(e.currentTarget).attr('data-rate-id') === undefined) {
		request('anime.addRate', {
			anime_id: meta('anime:id'),
		   episode: meta('anime:episode')
		}, setWatchButtonWithHref);

		return;
	}

	request('anime.episode.watch', {
		anime_id: meta('anime:id'),
	  episode: meta('anime:episode'),
	}, setWatchButtonWithHref)
})

request('anime.episode.isWatched', {
	anime_id: meta('anime:id'),
	episode: meta('anime:episode')
}, setWatchButton);
