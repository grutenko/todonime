import React, { Component } from "react";
import ReactDOM from 'react-dom';
import API from '../../lib/api';
import Auth from '../share/auth';

export default class Tab extends Component {
	constructor(props) {
		super(props);
		this.state = {
			active: this.props.active
		}
	}

	componentDidUpdate(prevProps) {
		if(prevProps.active != this.props.active) {
			this.setState(Object.assign(this.state, {
				active: this.props.active
			}))
		}
	}

	render() {
		var tabClass = "tabs__content-tab"
			+ (this.state.active ? " active" : "");

		var authRequired = this.props.children.props.auth;

		return (<div className={tabClass}>
			{authRequired != undefined && authRequired == "true" && !API.isAuth()
				? <Auth/>
				: this.props.children}
		</div>);
	}
}

Tab.defaultProps = {
	active: false,
	name: 'Unnamed'
};