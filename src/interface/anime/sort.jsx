import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Window from '../share/windows';
import Select from '../share/select';

import {SORT} from '../../lib/anime';

export default class Sort extends Component {
	constructor(props) {
		super(props);
		this.state = {show: false};
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

	render() {
		return (<span>
			<img className="tools__button"
				src="/images/sort.png"
				onClick={this.toggle.bind(this)}
			/>
			{this.state.show ? this.makeWindow() : null}
		</span>);
	}
}