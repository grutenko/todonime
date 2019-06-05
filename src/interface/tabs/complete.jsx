import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class CompleteTab extends Component {
	render() {
		return (<div className="tab__complete">
			<Animes list="completed" limit="20" listHeight="510"/>
		</div>);
	}
}