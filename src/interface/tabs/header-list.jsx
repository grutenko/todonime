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
	    		id={i} key={i}
	    		name={tab.props.name}
	    		active={i == this.props.activeTab}
	    		onClick={this.onActiveHOrder(i)}
	    	/>
    	)}
    	{this.props.showSettingsButton
    		? <li style={{flex: 'inherit'}} onClick={this.onSettings.bind(this)} className="tabs__header-element no-hover">
    			<img style={{width: '18px',height: '18px'}} src="/images/settings.png" />
    		</li>
    		: null}
		</ul>);
	}
}

HeaderList.defaultProps = {
	showSettingsButton: false
}