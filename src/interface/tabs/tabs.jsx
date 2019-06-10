import React, { Component } from "react";
import ReactDOM from 'react-dom';

import HeaderList from './header-list'
import Tab from './tab';

import {set} from '../../lib/settings';

export default class Tabs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: this.props.activeTab
		};
	}

	makeTabsContent() {
		return (<div className="tabs__content-list">
			{React.Children.map(this.props.children, (tab, i) =>
	    	<Tab key={i} active={i == this.state.activeTab}>
	    		{tab}
	    	</Tab>
    	)}
		</div>);
	}

	onActive(id) {
		this.setState({activeTab: id});
		set('activeTab', id);
	}

	render() {
		return (<div className="tabs">
			<HeaderList
				showSettingsButton={this.props.showSettingsButton}
				activeTab={this.state.activeTab}
				onActive={this.onActive.bind(this)}
			>
				{this.props.children}
			</HeaderList>
			{this.makeTabsContent()}
		</div>);
	}
}

Tabs.defaultProps = {
	activeTab: 0,
	showSettingsButton: false
};
