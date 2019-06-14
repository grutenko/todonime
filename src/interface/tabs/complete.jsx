import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class CompleteTab extends Component {
	render() {
		return (<Animes list="completed" limit="20" active={this.props.active}/>);
	}
}

CompleteTab.defaultProps = {
	active: false
};
