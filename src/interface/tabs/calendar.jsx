import React, { Component } from "react";
import ReactDOM from 'react-dom';

import Calendar from '../calendar/list';

export default class CalendarTab extends Component {
	render() {
		return (<div className="tab__calendar">
			<Calendar offset="0" />
		</div>);
	}
}