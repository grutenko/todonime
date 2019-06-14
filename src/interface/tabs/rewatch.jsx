import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class RewatchTab extends Component {
	render() {
		return (
			<Animes
				list="rewatching"
				limit="20"
				useFavorites="true"
				active={this.props.active}
			/>);
	}
}

RewatchTab.defaultProps = {
	active: false
};
