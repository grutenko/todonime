import React, { Component } from "react";
import ReactDOM from 'react-dom';
import API, {authorize} from '../model/api';
import * as Fvr from '../model/favorites';

export const ButtonMore = ({count, onClick}) =>
	<button className="main__button more-animes" onClick={onClick}>{"Еще " +count}</button>
	
export const ButtonMoreMessages = ({count, onClick}) =>
	<button className="main__button more-messages" onClick={onClick}>{"Еще " +count}</button>
	
export const ButtonBack = ({text, onClick}) =>
	<button className="main__button back__button" onClick={onClick}>{text}</button>
	
export const Search = ({onUpdate}) => {
	var onClick = (e) => {
		let text = $(e.currentTarget).val().trim();
		if(text == "") {
			onUpdate("");
			return;
		}
		
		if(e.keyCode == 13 && text !== "") onUpdate(text);
	};
	
	return (
		<input onKeyUp={onClick} type="text" className="search__input" placeholder="Поиск"/>
	);
}

export const Tools = ({children, ...props}) =>
	<div className="filter" {...props}>{children}</div>


export class Auth extends Component {
	constructor(props) {
		super(props);
		this.state = {
			auth: false
		}
	}
	
	onClick() {
		chrome.tabs.create({url: '/options.html'});
	}
	
	render() {
		return (
			<div className="auth_required">
				<p>Для доступа к этому разделу необходимо авторизиоваться на Shikimori.org</p>
				<button className="main__button button__auth" onClick={this.onClick.bind(this)}>Авторизация</button>
			</div>
		);
	}
}

export const Loader = ({text}) =>
	<div className="loader__container">
		<img src="images/loader-main.svg" />
	</div>

export class Favorite extends Component {

	constructor(props) {
		super(props);
		this.state = {
			active: Fvr.exists(props.id)
		}
	}

	componentDidMount() {
		document.addEventListener('favorites', (e) => {
			if(e.detail.id == this.props.id)
				this.setState({active: e.detail.action == "add"});
		})
	}

	onClick() {
		if(this.state.active) Fvr.unset(this.props.id);
			else Fvr.add(this.props.id);
	}

	render() {
		return this.state.active
			? <span className="favorite" onClick={this.onClick.bind(this)}>&#9733;</span>
			: <span className="favorite" onClick={this.onClick.bind(this)}>&#9734;</span>
	}
}