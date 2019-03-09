import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Tabs from './components/tabs.jsx';
import * as SettingsTabs from './components/settingsTabs.jsx';

export default class Settings extends Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<Tabs activeTab="3">
				<SettingsTabs.GeneralTab name="Основные" />
				<SettingsTabs.PersonalizeTab name="Персонализация" />
				<SettingsTabs.SecurityTab name="Безопасность" />
				<SettingsTabs.AccountTab name="Аккаунт" />
			</Tabs>
		);
	}
}