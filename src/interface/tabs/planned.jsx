import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class PlannedTab extends Component {
	render() {
		return (<div className="tab__planned">
			<Animes list="planned" limit="20" />
		</div>);
	}
}