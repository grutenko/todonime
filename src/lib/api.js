function request(path, params, method) {
	return new Promise((resolve, reject) => {
		method = (method === undefined ? "GET" : method);
			
		$.ajax({
			url:"https://api.todonime.space" + path,
			type: method,
			contentType: "application/json; charset=utf-8",
			data:JSON.stringify(params),
			dataType:"json"
		}).then(
			(data) => resolve(data),
			(xhr, textStatus, errorThrown) => reject(xhr, errorThrown)
		);
	});
}

export default class API {
	getEpisodes(anime_id) {
		return request('/video/'+anime_id+'/episodes');
	}

	getVideos(anime_id, episode) {
		return request('/video/'+anime_id+'/'+episode);
	}
}