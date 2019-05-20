import React, { Component } from "react";
import ReactDOM from 'react-dom';

import Tabs from './interface/tabs/tabs';
import WatchTab from './interface/tabs/watch';
import PlannedTab from './interface/tabs/planned';
import DroppedTab from './interface/tabs/dropped';
import CalendarTab from './interface/tabs/calendar';

export default class App extends Component {
	render() {
		return (
			<div className="app__container">
				<Tabs activeTab="1">
					<PlannedTab name="Запланировано" auth="true"/>
					<WatchTab name="Смотрю" auth="true"/>
					<DroppedTab name="Брошено" auth="true"/>
					<CalendarTab name="Календарь"/>
				</Tabs>
			</div>
		)
	}
}