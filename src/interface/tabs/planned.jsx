import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class PlannedTab extends Component {
	render() {
		return (<Animes list="planned" limit="20" active={this.props.active}/>);
	}
}

PlannedTab.defaultProps = {
	active: false
};
