import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class DroppedTab extends Component {
	render() {
		return (<div className="tab__dropped">
			<Animes list="dropped" limit="20"/>
		</div>);
	}
}
