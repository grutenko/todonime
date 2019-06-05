import PNotify from 'pnotify/dist/es/PNotify';
import PNotifyButtons from 'pnotify/dist/es/PNotifyButtons';

var store = {};

function send(message, callback) {
    const storeID = Math.floor(Math.random()*1000);
    chrome.runtime.sendMessage(Object.assign(message, {storeID}));
    
    store[storeID] = callback;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		store[request.storeID](request);
});

function meta(name) {
	const metas = document.getElementsByTagName('meta');

  for (let i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute('name') === name) {
      return metas[i].getAttribute('content');
    }
  }

  return '';
}

send({c:'whoami'}, ({response}) => {
	$('.account').html(
		$('<a class="no-margin" href="https://shikimori.one/'+response.nickname+'">'+
			'<img style="border-radius: 50%;" class="avatar__min" src="'+response.image.x48+'">' +
			'<div class="nickname hide-min">'+response.nickname+'</div>'+
		'</a>')
	);
})

function setWatchButton({response, rateID}) {
	if(response) {
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
		send({
			c: 'add-rate',
			data: {
				anime_id: meta('anime:id'),
		    episode: meta('anime:episode')
			}
		}, setWatchButtonWithHref);

		return;
	}

	send({
		c: 'send-watch',
		data: {
			anime_id: meta('anime:id'),
	    	episode: meta('anime:episode'),
	    	rateID: $(e.currentTarget).attr('data-rate-id')
		}
	}, setWatchButtonWithHref)
})

send({
	  c: 'watched',
	  data: {
	    anime_id: meta('anime:id'),
	    episode: meta('anime:episode')
    }
}, setWatchButton);