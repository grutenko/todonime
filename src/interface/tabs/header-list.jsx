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
		</ul>);
	}
}