import React, { Component } from "react";
import ReactDOM from 'react-dom';
import HeaderItem from './header-item';

export default class HeaderList extends Component {

	onActive(id) {
		if(this.props.activeTab != id)
				this.props.onActive(id);
	}

	onActiveHOrder(id) {
		return () => this.onActive(id);
	}

	onSettings() {
		chrome.tabs.create({'url': "/options.html" });
	}

	render() {
		return (<ul className="tabs__header">
			{React.Children.map(this.props.children, (tab, i) =>
	    	<HeaderItem
	    		id={i}
	    		iconName={tab.props.iconName}
	    		name={tab.props.name}
	    		active={i == this.props.activeTab}
	    		onClick={this.onActiveHOrder(i)}
	    	/>
    	)}
    	{this.props.showSettingsButton
    		? <li onClick={this.onSettings.bind(this)} className="tabs__header-element">
    			<i className="material-icons">settings</i>
    		</li>
    		: null}
		</ul>);
	}
}

HeaderList.defaultProps = {
	showSettingsButton: false
}