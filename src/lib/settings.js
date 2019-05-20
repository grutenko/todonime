/*

*/
export function setOption(name, value) {
	localStorage[name] = value;
	
	document.dispatchEvent(
		new Event('settingsUpdate')
	);
}

/*

*/
export function onStorage(key, callback) {
	addEventListener('storage', (e) => {
		if(e.key != key) return;
		callback(e);
	});
}