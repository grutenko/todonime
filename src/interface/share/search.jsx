import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class Search extends Component {
	onKeyUp(e) {
		let text = $(e.currentTarget).val().trim();
		if(text == "") {
			this.props.onReset();
			return;
		}
		
		if(e.keyCode == 13 && text != "")
			this.props.onApply(text);
	}

	render() {
		return (
			<input onKeyUp={this.onKeyUp.bind(this)}
				type="text"
				className="search__input"
				placeholder="Поиск"
			/>);
	}
}