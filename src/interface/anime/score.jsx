import React, { Component } from "react";
import ReactDOM from 'react-dom';

export default class Score extends Component {
	__makeInsideScore(rates) {
		let score = 0, sum = 0;
		for(let i in rates) {
			score += rates[i].name * rates[i].value;
			sum += rates[i].value;
		}

		return Math.round((score / sum) * 100) / 100;
	}

	format(score) {
		 return '★'.repeat(Math.round(score / 2))
			+ '☆'.repeat(5 - Math.round(score / 2));
	}

	render() {
		const scoreValue = this.props.insideDefault
				? this.__makeInsideScore(this.props.insideRates)
				: this.props.value;

		const score = this.format(scoreValue);

		return (
			<div className="favorite">
				{score}
				<span className="rate">{scoreValue}</span>
			</div>);
	}
}

Score.defaultProps = {
	insideRates: [],
	insideDefault: false,
	score: 0
}