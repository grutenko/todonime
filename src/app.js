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


export default class App extends Component {
	render() {
		return (
			<div className="app__container">
				<Tabs activeTab={get('activeTab') || 1} showSettingsButton={true}>
					<PlannedTab iconName="add" name="Запланировано" auth="true"/>
					<WatchTab iconName="play_arrow" name="Смотрю" auth="true"/>
					<RewatchTab iconName="replay" name="Пересматриваю" auth="true"/>
					<DroppedTab iconName="delete" name="Брошено" auth="true"/>
					<OnHoldTab iconName="pause" name="Отложено" auth="true"/>
					<CompleteTab iconName="check" name="Просмотрено" auth="true"/>
				</Tabs>
			</div>
		)
	}
}
