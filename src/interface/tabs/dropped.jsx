import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class DroppedTab extends Component {
	render() {
		return (<Animes list="dropped" limit="20" active={this.props.active}/>);
	}
}

DroppedTab.defaultProps = {
	active: false
};
