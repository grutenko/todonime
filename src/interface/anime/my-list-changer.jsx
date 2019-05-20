import React, { Component } from "react";
import ReactDOM from 'react-dom';

const LIST = [
	{code: 'planned', name: 'Запланировано'},
	{code: 'watching', name: 'Смотрю'},
	{code: 'completed', name: 'Просмотрено'},
	{code: 'rewatching', name: 'Пересматриваю'},
	{code: 'dropped', name: 'Брошено'},
	{code: 'on_hold', name: 'Отложено'}
];

export default class MylistChanger extends Component {
	onChange(e) {
		this.props.onChange(e.target.value);
	}

	render() {
		return (
			<select {...this.props} onChange={this.onChange.bind(this)} value={this.props.list}>
				{LIST.map((item, i) => <option key={i} value={item.code}>{item.name}</option>)}
			</select>);
	}
}