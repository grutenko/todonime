import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class Bookmark extends Component {
	render() {
		return (
			<span
				className="favorite"
				title={this.props.active ? 'Убрать из закладок' : 'Добавить в закладки'}
				onClick={this.props.toggle}
			>
				{this.props.active ? '★' : '☆'}
			</span>)
	}
}