import React, { Component } from "react";
import ReactDOM from 'react-dom';

import {instance} from '../../lib/shikimori-api';
import {request} from '../../lib/background-api';
import {dispatch} from '../../lib/event';

export default class Auth extends Component {
	auth() {
		request('user.auth', {}, (response) => {
			instance().then(api => dispatch('auth', {api}));
		});
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
