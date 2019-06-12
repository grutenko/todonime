import React, { Component } from "react";
import ReactDOM from 'react-dom';

import Window from '../share/windows';
import Picker from '../share/picker';

import {compare} from '../../lib/compare';
import {KIND, RATING} from '../../lib/anime';

export default class Filter extends Component {
	constructor(props) {
		super(props);
		this.state = {
			show: false,
			filter: this.props.define
		};

		this.id = Math.floor(Math.random * 1000);
	}

	componentDidUpdate(prevProps) {
		if(!compare(prevProps.define, this.props.define))
			this.setState({filter: this.props.define});
	}

	makePicker(options, define, name, callback) {
		const format = (opts, codes) => {
			let newObj = {};
			for(let i in opts)
				if(codes.indexOf(i) != -1) newObj[i] = opts[i];

			return newObj;
		};

		options = this.__toObject(options);

		return <Picker
			options={options}
			define={format(options, define)}
			name={name}
			onChange={callback}
		/>
	}

	onChangeKind(codes) {
		this.change('kind', codes);
	}

	onChangeRating(codes) {
		this.change('rating', codes);
	}

	change(key, codes) {
		this.setState((state, props) => {
			return {
				filter: Object.assign(state.filter, {
					[key]: codes
				})
			}
		})
	}

	onApply() {
		this.props.onApply(this.state.filter);
		this.setState({show: false});
	}

	makeWindow() {
		var {kind, rating} = this.state.filter;
		return (
			<Window style={{
				width: '250px',
				right: '5px'
			}}>
				<div className="h">Тип</div>
				{this.makePicker(KIND, kind, 'Тип', this.onChangeKind.bind(this))}
				<div className="h">Рейтинг</div>
				{this.makePicker(RATING, rating, 'Рейтинг', this.onChangeRating.bind(this))}
				<button className="main__button" onClick={this.onApply.bind(this)}>применить</button>
			</Window>
		);
	}

	__toObject(arCodeName) {
		var codeNameObj = {};
		for(let i in arCodeName)
			codeNameObj[arCodeName[i].code] = arCodeName[i].name;

		return codeNameObj;
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
		return (<span id={this.id} onMouseOut={this.onMouseOut.bind(this)}>
			{this.state.show ? this.makeWindow() : null}
			<i className="material-icons tools__button"
			   onClick={this.toggle.bind(this)}
			>
				filter_list
			</i>
		</span>);
	}
}
