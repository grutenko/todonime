import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class Status extends Component {
	__getRussian(status) {
		switch(status) {
			case 'released': return 'вышло'; break;
			case 'anons': return 'анонс'; break;
			case 'ongoing': return 'онгоинг'; break;
		}
	}

	render() {
		var status = this.props.status;
		return (<div className={'anime__status ' + status}>
			{this.__getRussian(status)}
		</div>);
	}
}