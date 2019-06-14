import React, { Component } from "react";
import ReactDOM from 'react-dom';

import Window from './windows';


export default class AutoCloseModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			show: this.props.showDefault
		};

		this.id = 'modal-' + Math.floor(Math.random() * 1000);
	}

	componentDidUpdate(prevProps) {
		if(prevProps.showDefault != this.props.showDefault)
			this.setState({show: this.props.showDefault});
	}

	onMouseOut(e) {
		if(!this.state.show) return;
		const element = e.nativeEvent.relatedTarget;

		if(element === undefined) {
			this.setState({show: false});
			return;
		}

		if(element.id != this.id
			&& element.closest('#' + this.id) == null
			&& this.state.show)
		{
			this.setState({show: false})
		}
	}

	onToggle() {
		this.setState({show: !this.state.show});
	}

	render() {
		const {button, children} = this.props;
		return (
			<span id={this.id} onMouseOut={this.onMouseOut.bind(this)}>
				{React.cloneElement(button, {onClick: this.onToggle.bind(this)})}
				{this.state.show ? children : null}
			</span>
		);
	}
}
