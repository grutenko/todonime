import React, { Component } from "react";
import ReactDOM from 'react-dom';

import Tabs from './interface/tabs/tabs';
import WatchTab from './interface/tabs/watch';
import PlannedTab from './interface/tabs/planned';
import DroppedTab from './interface/tabs/dropped';
import RewatchTab from './interface/tabs/rewatch';
import CompleteTab from './interface/tabs/complete';
import OnHoldTab from './interface/tabs/on-hold';

import {get} from './lib/settings';

const TABS_KEYS = [
	'planned',
	'watching',
	'rewatching',
	'on_hold',
	'completed',
	'dropped',
];

const ALL_TABS = {
	'planned': <PlannedTab key={1} iconName="add" name="Запланировано" auth="true"/>,
	'watching': <WatchTab key={2} iconName="play_arrow" name="Смотрю" auth="true"/>,
	'rewatching': <RewatchTab key={3} iconName="replay" name="Пересматриваю" auth="true"/>,
	'on_hold': <OnHoldTab key={4} iconName="pause" name="Отложено" auth="true"/>,
	'completed': <CompleteTab key={5} iconName="check" name="Просмотрено" auth="true"/>,
	'dropped': <DroppedTab key={6} iconName="delete" name="Брошено" auth="true"/>,
};


export default class App extends Component {
	render() {
		const tabKeys = get('usedTabs') || TABS_KEYS;

		return (
			<div className="app__container">
				<Tabs
					activeTab={get('activeTab') || get('defaultActiveTab') || 1}
					showSettingsButton={get('showSettingsButton') || false}
					showTitle={true}
				>
					{
						Object.entries(ALL_TABS).filter(([key, value]) => {
							return tabKeys.indexOf(key) != -1;
						})
						.map(([key, value]) => value)
					}
				</Tabs>
			</div>
		)
	}
}
