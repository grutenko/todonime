import React, { Component } from "react";
import ReactDOM from 'react-dom';

import {authorize} from '../../lib/api';

export default class Auth extends Component {
	auth() {
		authorize({
			responseType: 'code',
			redirectUri: chrome.identity.getRedirectURL('provider_cb')
		})
		.then(api => {
			this.props.onAuth(api);
		})
	}

	render() {
		return (
			<div className="auth_required">
				<p>Для  доступа к этому разделу необходиом авторизироваться через shikimori.one</p>
				<button
					className="main__button button__auth"
					onClick={this.auth.bind(this)}
				>
					Авторизация
				</button>
			</div>
		);
	} 
}