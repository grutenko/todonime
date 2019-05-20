import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class Calendar extends Component {
	constructor(props) {
		super(props);
		this.state = {offset: this.props.offset};
	}

	render() {
		return (
			<div className="calendar">
				<div className="calendar__header">
					<img className="tools__button" src="/images/arrow-left.png"/>
					<div className="calendar__title">Сегодня</div>
					<img className="tools__button"  src="/images/arrow-right.png"/>
				</div>
			</div>);
	}
}

Calendar.defaultProps = {
	offset: 0 // Offset from current day
};