export function show(id, props, callback) {
	chrome.notifications.create(id, Object.assign(props, {type: 'basic'}));
}
