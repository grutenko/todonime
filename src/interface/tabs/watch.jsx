import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class WatchTab extends Component {
	render() {
		return (<div className="tab__watch">
			<Animes list="watching" limit="40" useFavorites="true"/>
		</div>);
	}
}