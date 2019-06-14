import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Animes from '../anime/list';

export default class WatchTab extends Component {
	render() {
		return (
			<Animes
				list="watching"
				limit="20"
				useFavorites="true"
				active={this.props.active}
			/>
		);
	}
}

WatchTab.defaultProps = {
	active: false
};
