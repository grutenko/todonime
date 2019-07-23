import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class HeaderItem extends Component {
	constructor(props) {
		super(props)

		this.state = {
			dragged: false
		}

		this.id = 'tab-header_'+Math.floor(Math.random() * 1000);
	}

	onDragEnter(e) {
		this.setState({dragged: true});
	}

	onDragLeave(e) {
		const el = $(e.nativeEvent.relatedTarget);

		if(el.closest('#'+this.id).length == 0)
			this.setState({dragged: false})
	}

	render() {
		var liClass = "tabs__header-element"
			+ (this.props.active ? " active" : "")
			+ (this.state.dragged ? " dropped" : '')

		const {id} = this.props;

		return (
			<li
				key={id}
				id={this.id}
				onClick={this.props.onClick}
				className={liClass}
				title={this.props.name}
				style={this.props.style}
				onDragEnter={this.onDragEnter.bind(this)}
				onDragLeave={this.onDragLeave.bind(this)}
			>
				<i className="material-icons">{this.props.iconName}</i>
				{this.props.showTitle
					? <span className="tab__placeholder show-active">{this.props.name}</span>
					: null
				}
			</li>
		);
	}
}
