var store = {};

function send(message, callback) {
    const storeID = Math.floor(Math.random()*1000);
    chrome.runtime.sendMessage(Object.assign(message, {storeID}));
    
    store[storeID] = callback;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if(request.storeID == -1) {
		var url = location.href.match(/\/+animes\/+[a-z]?(\d+)-([a-z0-9\-]+)/);
		if(url[1]) makeButton(url);
	}

  store[request.storeID](request);
});

function createButton(url) {
	var button = $('<section></section>')
		.addClass('block')
		.addClass('watch-online-block');

	button.html('<a class="play-button" href="'+url+'">'
		+'<img src="https://todonime.space/images/logotype-48x48.png" style="width:24px;height: 24px">'
		+'<span class="play-button-text">Смотреть онлайн</span></a>');
	$('.watch-online-placeholer').html(button);
}

function makeButton(url) {
	send({
			c: 'get-anime',
			data: {anime_id: url[1]}
		},
		({anime}) => {
			if(anime.status == 'anons') return;

			const rate = anime.user_rate;
			const episode = !rate
				? 1
				: ((anime.status == 'ongoing' && rate.episodes < anime.episodes_aired) || (anime.status == 'released' && rate.episodes < anime.episodes)
						? rate.episodes + 1
						: rate.episodes);

			createButton('https://todonime.space/video/'+url[1]+'/' + episode + '?back='+location.href)
		});
}

var url = location.href.match(/\/+animes\/+[a-z]?(\d+)-([a-z0-9\-]+)/);
if(url != null) makeButton(url);