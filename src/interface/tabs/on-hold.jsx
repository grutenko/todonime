import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class OnHoldTab extends Component {
	render() {
		return (<Animes list="on_hold" limit="20" active={this.props.active}/>);
	}
}

OnHoldTab.defaultProps = {
	active: false
};
