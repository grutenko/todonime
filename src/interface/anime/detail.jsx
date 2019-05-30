import React, { Component } from "react";
import ReactDOM from 'react-dom';

import Score from './score';
import Loader from '../share/loader';
import {getDetail} from '../../lib/anime';

import Moment from 'moment';
import 'moment/locale/ru';

export default class Detail extends Component {
	constructor(props) {
		super(props);
		this.state = {loaded: false};

		this.anime = null;
	}

	__makeStudioLink(studio) {
		return 'https://shikimori.one/animes/studio/' + studio.id + '-' + studio.filtered_name;
	}

	getData() {
		getDetail(this.props.animeID).then(anime => {
			this.anime = anime;
			this.setState({loaded: true});
		})
	}

	makeStudios() {
		return (
			<div className="studios">
				{this.anime.studios.map((studio, i) =>
					<a key={i}
						className="tag studio"
						href={this.__makeStudioLink(studio)}
						target="_blank"
					>
						{studio.name}
					</a>)}
			</div>
		);
	}

	__getAnimeDates() {
		const format = date =>
			<b><i>{Moment(date).format('DD MMMM YYYY')}</i></b>

		return <span>
			{format(this.anime.aired_on)}
			{(this.anime.released_on
						? <span> -  {format(this.anime.released_on)} </span>
						: null)
			}
		</span>
	}

	__getGenreLink(genre) {
		return 'https://shikimori.one/animes/genre/' + genre.id + '-' + genre.filtered_name;
	}

	makeGenresList() {
		return (
			<span className="genres">
			{this.anime.genres.map((genre, i) =>
				<a key={i} className="tag genre" href={this.__getGenreLink(genre)} target="_blank">{genre.russian}</a>)}
			</span>
		);
	}

	makeDetailInfo() {
		return (<div style={{margin: '10px 0'}}>
			<div>
				<span className="b-key">Статус:</span>
					<span className="tag status">{this.anime.status}</span> 
					{this.__getAnimeDates()}
			</div>
			<div>
				<span className="b-key">
					{['movie', 'music'].indexOf(this.anime.kind) != -1 ? 'Длительность' : 'Длительность эпизода'}:
				</span>
					{this.anime.duration} мин.
			</div>
			<div>
				<span className="b-key">Жанры:</span>
				{this.makeGenresList()}
			</div>
		</div>);
	}

	makeDetailBlock() {
		return (
			<div>
				<div style={{display: 'flex', margin: '10px 0'}}>
					<Score
						value={this.anime.score}
						insideRates={this.anime.rates_scores_stats}
						insideDefault="true" 
					/>
					{this.makeStudios()}
				</div>
				{this.makeDetailInfo()}
			</div>
		);
	}

	render() {
		if(!this.state.loaded && this.anime == null && this.props.show)
			this.getData();

		return (<span>
			<img
				className="tools__button coffee show-anime-hover"
				style={{width: '18px', height: '18px'}}
				src={this.props.show ? '/images/arrow-turn.png' : '/images/arrow-expand.png'}
				title={this.props.show ? 'Свернуть детальное описание' : 'Показать детальное описание	'}
				onClick={this.props.onToggle}
			/>
			{this.props.show
				? <div className="anime__container--detail">
					{this.state.loaded ? this.makeDetailBlock() : <Loader />}
				</div>
				: null}
		</span>);
	}
}