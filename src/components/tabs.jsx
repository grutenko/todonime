import React, { Component } from "react";
import ReactDOM from 'react-dom';
import API from '../model/api';

import {Auth} from "../interface/misc.jsx";
import {Animes} from "../interface/animes.jsx";
import {Dialogs} from "../interface/messaging.jsx";

export default class Tabs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: this.props.activeTab
		};
	}
	
	onUpdate(activeTab) {
		this.setState({activeTab: activeTab})
	}
	
	render() {
		return (
			<div className="tabs">
				<TabsHeader
					activeTab={this.state.activeTab}
					onUpdate={this.onUpdate.bind(this)}
				>
					{this.props.children}
				</TabsHeader>
				<TabsContent activeTab={this.state.activeTab}>
					{this.props.children}
				</TabsContent>
			</div>
		);
	}
}

class TabsHeader extends Component {
	constructor(props) {
		super(props);
		this.state = {activeTab: props.activeTab};
	}
	
	onClick(e) {
		let ID = $(e.target).attr("data-id");
		if(ID != this.state.activeTab)
				this.props.onUpdate(ID);
	}
	
	componentDidUpdate(prevProps) {
		if(this.props.activeTab !== prevProps.activeTab) {
			this.setState({
				activeTab: this.props.activeTab
			});
		}
	}
	
	render() {
		return (
			<ul className="tabs__header">
				{
					React.Children.map(this.props.children, (c, i) => {
						return (<TabsHeaderElement
								onClick={this.onClick.bind(this)}
								active={(i == this.state.activeTab ? "true" : "false")}
								id={i} 
								name={c.props.name} />)
					})
				}
			</ul>
		);
	}
}

class TabsContent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: props.activeTab
		};
		
		this.__setTabActive = this.__setTabActive.bind(this);
	}
	
	componentDidUpdate(prevProps) {
		if(this.props.activeTab !== prevProps.activeTab) {
			this.setState({
				activeTab: this.props.activeTab
			});
		}
	}
	
	__setTabActive( tab ) {
		return React.cloneElement(tab, {...tab.props, active: true});
	}
	
	render() {
		return (
			<div className="tabs__content-list">
			{
				React.Children.map(this.props.children, (c, i) => {
					return (
						<div
							className={"tabs__content-tab" + (i == this.state.activeTab? " active" : "")}
							data-id={i}
						>
						{i == this.state.activeTab
							? this.__setTabActive(c)
							: c}
					</div>);
				})
			}
			</div>
		);
	}
}

const TabsHeaderElement = ({name, id, onClick, active}) =>
	(<li
		className={"tabs__header-element" + (active == "true" ? " active" : "")}
		onClick={onClick}
		data-id={id}>
			{name}
	</li>);
	
export class Tab extends Component {
	constructor(props) {
		super(props);
		this.state = {
			active:false
		};
		
		/**
		 * If session data in storage did update (From settings maybe)
		 * Then update all tabs.
		 */
		addEventListener('storage', (e) => {
			if(e.key == 'shikimori_session') this.forceUpdate();
		});
	}
	
	componentDidUpdate(prevProps) {
		if(this.props.active !== prevProps.active) {
			this.setState({active: this.props.active})
		}
	}
	
	onAuth() {
		this.forceUpdate();
	}
	
	__auth() {
		return (<Auth onAuth={this.onAuth.bind(this)}/>);
	}
}

Tab.defaultProps = {
	active: false
};
	
export class MailTab extends Tab {
	constructor(props) {		
		super(props);
	}
	
	render() {
		return (
			<div className="tab mail_tab">
			{API.isAuth()
				? <Dialogs limit="20" search={null} />
				: this.__auth()
			}
			</div>
		);
	}
}

export class PlannedTab extends Tab {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="tab planned_tab">
			{API.isAuth()
				? <Animes type="planned" limit="20" search={null}/>
				: this.__auth()
			}
			</div>
		);
	}
}

export class WatchingTab extends Tab {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div className="tab watching_tab">
			{API.isAuth()
				? <Animes type="watching" limit="20" search={null}/>
				: this.__auth()
			}
			</div>
		);
	}
}


export class BookmarksTab extends Tab {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div className="tab bookmarks_tab"></div>
		);
	}
}