import React, { Component } from "react";
import ReactDOM from 'react-dom';

import {Tab} from './tabs.jsx';
import {Account} from '../interface/settings.jsx';

export class GeneralTab extends Tab {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div className="tab general-tab">
			
			</div>
		);
	}
}

export class PersonalizeTab extends Tab {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div className="tab personalize-tab">
			
			</div>
		);
	}
}

export class SecurityTab extends Tab {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div className="tab security-tab">
			
			</div>
		);
	}
}

export class AccountTab extends Tab {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div className="tab account-tab">
				<div className="hettings__header">Подключенный аккаунт</div>
				<Account />
			</div>
		);
	}
}