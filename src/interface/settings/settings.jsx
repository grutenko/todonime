import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import Tabs from '../tabs/tabs';
import GeneralSettings from '../tabs/general-settings';
import AccountSettings from '../tabs/account-settings';
import DesignSettings from '../tabs/design-settings';

export default class Settings extends Component {
	render() {
		return (
			<div className="app__container">
				<Tabs activeTab={0} showSettingsButton={false} showTitle={false}>
					<GeneralSettings iconName="Основные" name="Основные"/>
					<DesignSettings iconName="Дизайн" name="Дизайн"/>
					<AccountSettings iconName="Аккаунт" name="Аккаунт"/>
				</Tabs>
			</div>);
	}
}
