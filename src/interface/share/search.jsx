import React, { Component, Fragment } from "react";
import ReactDOM from 'react-dom';

export default class Search extends Component {
	constructor(props) {
		super(props);
		this.ref = React.createRef();
	}

	componentDidUpdate(prevProps, prevState) {
		if(this.props.q != prevProps.q) {
			$(this.ref).val(this.props.q);
		}
	}

	onClick(e) {
		const text = $(this.ref)
			.val()
			.trim();

		if(text != '') this.props.onApply(text);
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
			<Fragment>
				<input
					onKeyUp={this.onKeyUp.bind(this)}
					onChange={()=>{}} // React warning
					defaultValue={this.props.q || ''}
					ref={(input) => {this.ref = input}}
					type="text"
					className="search__input"
					placeholder="Поиск"
				/>
				<i
					className="material-icons tools__button"
					onClick={this.onClick.bind(this)}
				>
					search
				</i>
			</Fragment>);
	}
}
