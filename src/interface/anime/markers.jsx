import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Moment from 'moment'; 

/**
 * Constant with additional data for markers as
 * <key>: [<russian-name>, <background-color>, <text-color>, <value-update-callback>]
 * @type {Object}
 */
const MARKERS = {
	kind: [null, 'green', 'white', name => {
		switch(name) {
			case 'tv'			: return 'TV Сериал'; break;
			case 'ova'		: return 'OVA'; break;
			case 'ona'		: return 'ONA'; break;
			case 'special': return 'Спешл'; break;
			case 'movie'	: return 'Фильм'; break;
			case 'music'	: return 'Клип'; break;
			default: return 'unknown';
		}
	}],
	aired_on: [null, '#75a4ef', '#484848', date => {
		Moment.locale('ru');
		return Moment(date).format('DD MMMM YYYY');
	}]
};

export default class Markers extends Component {
	render() {
		var markers = Object.entries(this.props.anime)
			.filter(prop => prop[1] != null && Array.isArray(MARKERS[prop[0]]))
			.map(prop => {
				const [key, value] = prop;
				let marker = MARKERS[key].slice(0);

				/*
				  Update 4st array item on value from function.
				  See const MARKERS
				 */
				marker[3] = marker[3](value);
				return marker;
			});

		return (
			<div className="anime__markers-container">
			{markers.map((marker, i) => {
				const [name, background, color, value] = marker;
				return (<div key={i} className="anime__marker" style={{background, color}}>
					{name ? name + ':' : ''} {value}
				</div>)
			})}
			</div>
		);
	}
}