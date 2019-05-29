var store = {};

function send(message, callback) {
    const storeID = Math.floor(Math.random()*1000);
    chrome.runtime.sendMessage(Object.assign(message, {storeID}));
    
    store[storeID] = callback;
}

function meta(name) {
	const metas = document.getElementsByTagName('meta');

  for (let i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute('name') === name) {
      return metas[i].getAttribute('content');
    }
  }

  return '';
}

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
	setWatchButton(response);
	if(!$('.to-next-episode').attr('href')) {
		alert('нету следующего эпизода');
		return;
	}

	location.href = $('.to-next-episode').attr('href');
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    store[request.storeID](request);
});

$(".b-click-watched:not(.watched)").on('click', (e) => {
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