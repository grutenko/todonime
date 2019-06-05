const REQUIRED_EVENT_PROPS = {
	favorites: ['type', 'ids'],
	toggleDetail: ['type', 'list', 'id', 'el'],
	changeList: ['from', 'to', 'id']
}

var listeners = {};

function check(name, props) {
	if(REQUIRED_EVENT_PROPS[name] == undefined)
		return true;

	const keys = REQUIRED_EVENT_PROPS[name];
	for(let i in keys) if(props[keys[i]] === undefined) return false;

	return true;
}

export function dispatch(name, props) {
	if(!check(name, props))
		throw new Error('Invalid params for event "' + name + '".');

	document.dispatchEvent(
		new CustomEvent(name, {detail: props})
	);
}

export function subscribe(name, listener) {
	document.addEventListener(name, listener);
	const ID = Math.round(Math.random() * 10000);

	listeners[ID] = {name, listener};
	return ID;
}

export function unsubscribe(IDs) {
	if(!Array.isArray(IDs)) IDs = [IDs];

	for(let i in IDs) {
		const ID = IDs[i];

		if(listeners[ID] == undefined) return;

		const  {name, listener} = listeners[ID];
		document.removeEventListener(name, listener);
	}
}