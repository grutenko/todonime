import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Window from '../share/windows';
import Select from '../share/select';
import AutoCloseModal from '../share/autoclose-modal';

import {SORT} from '../../lib/anime';

export default class Sort extends Component {
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

	render() {
		return (
			<AutoCloseModal
				button={<i className="material-icons tools__button">sort_by_alpha</i>}
			>
				{this.makeWindow()}
		</AutoCloseModal>);
	}
}
