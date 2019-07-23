import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

import Picker from '../share/picker';
import {get, set} from '../../lib/settings';

import PNotify from 'pnotify/dist/es/PNotify';
import PNotifyButtons from 'pnotify/dist/es/PNotifyButtons';

const TABS = {
	'planned': 'Запланировано',
	'watching': 'Смотрю',
	'rewatching': 'Пересматриваю',
	'on_hold': 'Отложено',
	'completed': 'Просмотрено',
	'dropped': 'Брошено',
};

export default class GeneralSettings extends Component {
	constructor(props) {
		super(props);

		this.state = {
			tabs 						 : get('usedTabs') || Object.keys(TABS),
			activeTab 			 : get('defaultActiveTab') || 1,
			inOngoingNotifies: get('notifyOngoings')
		}

		this.onTabsChange = this.onTabsChange.bind(this);
		this.onActiveTabChange = this.onActiveTabChange.bind(this);
		this.onOngoingNotifiesChange = this.onOngoingNotifiesChange.bind(this);
	}

	onTabsChange(tabs) {
		this.setState({tabs});
		set('usedTabs', tabs);

		this.notify('Настройки используевых вкладок сохранены.');
	}

	onActiveTabChange(e) {
		const tab = $(e.currentTarget).val();

		this.setState({activeTab: tab});
		set('defaultActiveTab', tab);

		this.notify();
	}

	onOngoingNotifiesChange(e) {
		const isNotify = $(e.currentTarget).is(":checked");

		this.setState({inOngoingNotifies: isNotify});
		set('notifyOngoings', isNotify);

		this.notify();
	}

	notify(text) {
		PNotify.success({
		   text: 'Настройки сохранены',
		   addClass: 'z-indx-top b-white',
		   width: '250px',
		   minHeight: '32px',
	    delay: 1000
	  });
	}

	__format(tabKeys) {
		let tabs = Object.assign({}, TABS);

		for(let i in tabs) {
			if(this.state.tabs.indexOf(i) == -1)
				delete tabs[i];
		}

		return tabs;
	}

	render() {
		const arTabs = Object.entries(this.__format(this.state.tabs))
			.map(([key, value]) => {
				return {code: key, name: value}
			});

		return (
			<div style={{padding: '5px'}}>
				<div className="h">Используемые вкладки</div>
				<Picker
					options={TABS}
					define={this.__format(this.state.tabs)}
					name="Вкладки"
					onChange={this.onTabsChange}
				/>
				<label style={{marginRight: '5px'}}><i>Активная вкладка по умолчанию</i></label>
				<select
					onChange={this.onActiveTabChange}
					defaultValue={this.state.activeTab}
				>
					{arTabs.map(({name}, i) =>
						<option key={i} value={i}>{name}</option>
					)}
				</select>
				<div className="h">Аниме списки</div>
				<label>
					<input type="checkbox" onChange={this.onOngoingNotifiesChange}/>
					Уведомлять о новых сериях онгоингов в закладках.
				</label><br/>
				<label>
					<input type="checkbox" onChange={this.onOngoingNotifiesChange}/>
					Показывать рейтинг исходя из внтренних оценок shikimori.one <i>(По умолчанию рейтинг берется c myanimelist)</i>
				</label>
			</div>
		);
	}
}

GeneralSettings.defaultProps = {
	active: false
};
