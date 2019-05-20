import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class Select extends Component {
	constructor(props) {
		super(props);
		this.state = {active: this.props.active}

		this.onSelect = this.onSelect.bind(this);
	}

	componentDidUpdate(prevProps) {
		if(prevProps.active !== this.props.active) {
			this.setState({active: this.props.active});
		}
	}

	onSelect(e) {
		let id = $(e.currentTarget).attr('data-id');
		let code = $(e.currentTarget).attr('data-code');

		if(this.state.active == id) return;

		this.props.onSelect(code);
		this.setState({active: id});
	}

	render() {
		var items = this.props.items;
		return (
			<div className="select__component">
				{items.map((item, i) => {
					let addClass = this.state.active == i ? ' active' : '';
					return (
						<div
							key={i}
							className={'select__item' + addClass}
							data-id={i} data-code={item.code}
							onClick={this.onSelect}
						>
							{item.name}
						</div>
					);
				})}
			</div>
		);
	}
}

Select.defaultProps = {
	items: [],
	onSelect: () => {},
	active: -1
};