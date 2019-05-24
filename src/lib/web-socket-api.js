import {clientID, clientSecret} from "./shikimori-api";

var __COUNTER__ = 0;

/*

*/
function getClientID() {
	return new Promise((resolve, reject) => {
		var params = {
			"channel":"/meta/handshake",
			"version":"1.0",
			"supportedConnectionTypes":[
				"websocket",
				"eventsource",
				"long-polling",
				"cross-origin-long-polling",
				"callback-polling"
			],
			"id":"1"
		};
		
		$.ajax({
			url: "https://faye-v2.shikimori.one/",
			type: "GET",
			data: {
				message: JSON.stringify([params]),
				jsonp: "__jsonp1__"
			}
		})
		.done((data) => {
			var data = JSON.parse(data.replace(/\/\*\*\/__jsonp1__\(/g,'').replace(/\);/g,''));
			resolve(data[0]);
		});
	});
}

/*

*/
function send(ws, data, clientID) {
	__COUNTER__ += 1;
	data = Object.assign(data, {
		id: __COUNTER__.toString(),
		connectionType: "websocket",
		clientId: clientID 
	});
	
	ws.send(JSON.stringify([data]));
	return __COUNTER__;
}

/*

*/
function connect(clientID) {
	return new Promise((resolve, reject) => {
		let ws = new WebSocket("wss://faye-v2.shikimori.one/");
		ws.onopen = () => {
			send(ws, {channel: "/meta/connect"}, clientID);
			window.wsAPI = new WSAPI(ws, clientID);
			resolve(window.wsAPI);
		}
	});
}

/*

*/
export function authorize() {
	return new Promise((resolve, reject) => {
		getClientID()
		.then((clientData) => {
			return connect(clientData.clientId);
		})
		.then((wsapi) => resolve(wsapi));
	});
}

/*

*/
export class WSAPI {
	constructor(ws, clientID) {
		this.ws = ws;
		this.clientID = clientID;
		this.handlers = {};
		
		this.ws.onmessage = (response) =>
			this.__onMessage.call(this, JSON.parse(response.data));
	}
	
	/*

	*/
	subscribe(subscription, handler) {
		send(this.ws, {
			channel: "/meta/subscribe",
			subscription: subscription
		}, this.clientID);
		
		return this.__addHandler(subscription, handler);
	}
	
	/*

	*/
	removeHandler(subsciption, id) {
		if(this.handlers[subscription] !== undefined
				&& this.handlers[subscription][id] !== undefined) {
			this.handlers[subscription][id] = undefined;
		}
	}
	
	/*

	*/
	__addHandler(subscription, handler) {
		if(this.handlers[subscription] === undefined) {
			this.handlers[subscription] = [];
		}
		
		this.handlers[subscription].push(handler);
		return this.handlers[subscription].length - 1;
	}
	
	/*

	*/
	__onMessage(data) {
		data.forEach((e, i) => {
			if(e.data !== undefined && this.handlers[e.channel] !== undefined) {
				this.handlers[e.channel].forEach((c) => c(e.data));
			}
		})
	}
}

/*

*/
WSAPI.getInstance = function() {
	return window.wsAPI;
}