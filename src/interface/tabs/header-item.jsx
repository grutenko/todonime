import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class HeaderItem extends Component {
	render() {
		var liClass = "tabs__header-element"
			+ (this.props.active ? " active" : "");

		const {id} = this.props;

		return (
			<li key={id} onClick={this.props.onClick} className={liClass} title={this.props.name}>
				<i className="material-icons">{this.props.iconName}</i>
			</li>
		);
	}
}
