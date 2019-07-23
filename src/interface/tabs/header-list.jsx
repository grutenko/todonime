import React, { Component, Children } from "react";
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
		const {
			children,
			showTitle,
			activeTab,
			showSettingsButton
		} = this.props;

		const itemStyle = {
	    maxWidth: 400 - (Children.count(children) + (!showSettingsButton ? -1 : 0)) * 54
	  }

		return (<ul className="tabs__header">
			{Children.map(children, (tab, i) =>
	    	<HeaderItem
	    		id={i}
	    		showTitle={showTitle}
	    		iconName={tab.props.iconName}
	    		name={tab.props.name}
	    		active={i == activeTab}
	    		onClick={this.onActiveHOrder(i)}
	    		style={itemStyle}
	    	/>
    	)}
    	{showSettingsButton
    		? <li
    				onClick={this.onSettings.bind(this)}
    				className="tabs__header-element"
    			>
    				<i className="material-icons">settings</i>
    		</li>
    		: null}
		</ul>);
	}
}

HeaderList.defaultProps = {
	showSettingsButton: false
}
