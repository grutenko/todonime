import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class Window extends Component {
	render() {
		return (
			<div className="window" style={this.props.style}>
				<div className="window__content">
					{this.props.children}
				</div>
			</div>
		);
	}
}