import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class RewatchTab extends Component {
	render() {
		return (<div className="tab__rewatch">
			<Animes list="rewatching" limit="20" listHeight="510" useFavorites="true"/>
		</div>);
	}
}