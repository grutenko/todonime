import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class HeaderItem extends Component {
	render() {
		var liClass = "tabs__header-element"
			+ (this.props.active ? " active" : "");

		return (
			<li onClick={this.props.onClick} className={liClass}>
				{this.props.name}
			</li>
		);
	}
}