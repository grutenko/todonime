import React, { Component } from "react";
import ReactDOM from 'react-dom';

import Tabs from './interface/tabs/tabs';
import WatchTab from './interface/tabs/watch';
import PlannedTab from './interface/tabs/planned';
import DroppedTab from './interface/tabs/dropped';
import RewatchTab from './interface/tabs/rewatch';
import CompleteTab from './interface/tabs/complete';
import OnHoldTab from './interface/tabs/on-hold';


export default class App extends Component {
	render() {
		return (
			<div className="app__container">
				<Tabs activeTab="1" showSettingsButton={true}>
					<PlannedTab name="Запланировано" auth="true"/>
					<WatchTab name="Смотрю" auth="true"/>
					<OnHoldTab name="Отложено" auth="true"/>
					<Tabs name="Еще" activeTab="1">
						<RewatchTab name="Пересматриваю" auth="true"/>
						<CompleteTab name="Просмотрено" auth="true"/>
						<DroppedTab name="Брошено" auth="true"/>
					</Tabs>
				</Tabs>
			</div>
		)
	}
}