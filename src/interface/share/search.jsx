import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class Search extends Component {
	constructor(props) {
		super(props);
		this.ref = React.createRef();
	}

	componentDidUpdate(prevProps, prevState) {
		if(this.props.q != prevProps.q) {
			$(this.ref.current).val(this.props.q);
		}
	}

	onKeyUp(e) {
		let text = $(e.currentTarget).val().trim();
		if(e.keyCode == 8 && text == "")
			this.props.onReset();
		else if(e.keyCode == 13 && text != "")
			this.props.onApply(text);
	}

	render() {
		return (
			<input
				onKeyUp={this.onKeyUp.bind(this)}
				onChange={()=>{}} // React warning
				defaultValue={this.props.q || ''}
				ref={this.ref}
				type="text"
				className="search__input"
				placeholder="Поиск"
			/>);
	}
}