import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class Loader extends Component {
	render() {
		return (
			<div className="loader__container">
				<img src="/images/loader-main.svg" />
			</div>
		);
	} 
}