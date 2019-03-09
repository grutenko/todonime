import React, { Component } from "react";
import ReactDOM from 'react-dom';
import API, {authorize} from '../model/api';

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
		authorize({
			responseType: "code",
			redirectUri: chrome.identity.getRedirectURL('provider_cb')
		}).then((api) => {
			this.setState({auth: true});
			this.props.onAuth();
			
			window.sAPI = api;
		}, (error) => {
			console.log(error);
		});
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