import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class OnHoldTab extends Component {
	render() {
		return (<div className="tab__on-hold">
			<Animes list="on_hold" limit="20" listHeight="466"/>
		</div>);
	}
}