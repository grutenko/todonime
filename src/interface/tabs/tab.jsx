import React, { Component } from "react";
import ReactDOM from 'react-dom';
import ShikimoriAPI from '../../lib/shikimori-api';
import Auth from '../share/auth';
import {subscribe, unsubscribe} from '../../lib/event';

export default class Tab extends Component {
	constructor(props) {
		super(props);
		this.state = {
			active: this.props.active
		}
	}

	componentWillMount() {
		this.authEvent = subscribe('auth', ({detail}) => {
			this.forceUpdate();
		});
	}

	componentWillUnmount() {
		unsubscribe(this.authEvent);
	}

	componentDidUpdate(prevProps) {
		if(prevProps.active != this.props.active) {
			this.setState(Object.assign(this.state, {
				active: this.props.active
			}))
		}
	}

	render() {
		const {children} = this.props;
		const {active} = this.state;

		const tabClass = "tabs__content-tab" + (active ? " active" : "");
		const authRequired = children.props.auth;

		return (<div className={tabClass}>
			{authRequired == "true" && !ShikimoriAPI.isAuth()
				? <Auth/>
				: React.cloneElement(children, {active})}
		</div>);
	}
}

Tab.defaultProps = {
	active: false,
	name: 'Unnamed'
};
