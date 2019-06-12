import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Window from '../share/windows';
import Select from '../share/select';

import {SORT} from '../../lib/anime';

export default class Sort extends Component {
	constructor(props) {
		super(props);
		this.state = {show: false};
		this.id = Math.floor(Math.random * 1000);
	}

	onSelect(code) {
		this.setState({show: false});
		this.props.onApply(code);
	}

	__getActiveIndx(code) {
		let indx = -1;
		for(let i in SORT)
			if(SORT[i].code == this.props.active) {
				indx = i;
				break;
			}

		return indx;
	}

	makeWindow() {
		return (
			<Window style={{
				width: '200px',
				right: '35px'
			}}>
				<Select
					items={SORT}
					active={this.__getActiveIndx(this.props.active)}
					onSelect={this.onSelect.bind(this)}
				/>
			</Window>
		);
	}

	toggle() {
		this.setState({
			show: !this.state.show
		});
	}

	onMouseOut(e) {
		const element = e.nativeEvent.relatedTarget;

		if(element == null) {
			if(this.state.show) this.setState({show: false});
			return;
		}

		if(element.id != this.id
			&& element.closest('#' + this.id) == null
			&& this.state.show)
		{
			this.setState({show: false})
		}
	}

	render() {
		return (<span
				id={this.id}
				onMouseOut={this.onMouseOut.bind(this)}
			>
				<i className="material-icons tools__button" onClick={this.toggle.bind(this)}>sort_by_alpha</i>
				{this.state.show ? this.makeWindow() : null}
		</span>);
	}
}
