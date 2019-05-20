import React, { Component } from "react";
import ReactDOM from 'react-dom';

function compare(a1, a2) {
    return a1.length == a2.length && a1.every((v,i)=>v === a2[i])
}

export default class Picker extends Component {
	sendChange(options) {
		this.props.onChange(Object.keys(options));
	}

	onDelete(code) {
		return () => {
			let newOptions = Object.assign({}, this.props.define);
			delete newOptions[code];
			this.sendChange(newOptions);
		}
	}

	onAdd(e) {
		if(e.target.value == '__disabled__') return;
		this.add(e.target.value);

		$(e.target).val('__disabled__');
	}

	add(code) {
		if(this.props.options[code] == undefined) return;
		this.sendChange(Object.assign(this.props.define, {
				[code]: this.props.options[code]
		}));
	}

	deleteAll() {
		this.sendChange({});
	}

	addAll() {
		this.sendChange(this.props.options);
	}

	__getUnselected() {
		return Object.entries(this.props.options).filter(entry => {
			return this.props.define[entry[0]] == undefined;
		});
	}

	makeManager() {
		let length = Object.keys(this.props.define).length;
		return (
			<div className="filter__anime-type new">
				<button onClick={length == 0 ? this.addAll.bind(this) : this.deleteAll.bind(this)}>
					{length == 0 ? 'Все' : 'Убрать все'}
				</button>
				<select onChange={this.onAdd.bind(this)}>
					<option key="-1" value="__disabled__">--{this.props.name}--</option>
					{this.__getUnselected().map((entry, i) => 
						<option key={i} value={entry[0]}>{entry[1]}</option>)}
				</select>
			</div>
		);
	}

	makeOption(option, i) {
		const [code, name] = option;
		return (
			<div key={i} className="filter__anime-type" data-code={code}>
				{name}
				<img className="cancel" src="/images/cancel.svg" onClick={this.onDelete(code)} />
			</div>);
	}

	render() {
		let options = Object.entries(this.props.define);
		return (
			<div className="filter__anime-types">
				{options.map((option, i) => this.makeOption(option, i))}
				{this.makeManager()}
			</div>);
	}
}