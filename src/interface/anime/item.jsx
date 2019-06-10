import React, { Component } from "react";
import ReactDOM from 'react-dom';

import Markers from './markers';
import Status from './status';
import Bookmark from './bookmark';
import Detail from './detail';
import MylistChanger from './my-list-changer';
import Window from '../share/windows';
import {todonimeURLMake} from '../../lib/url-maker';

import {add, unset} from '../../lib/favorites';
import {dispatch} from '../../lib/event';

export default class Anime extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showDetail: false,
			showEpisodesChanger: false
		};

		this.id = 'anime-' + this.props.options.id;

		this.ref = React.createRef();
	}

	__getWatchedSeries() {
		var {watched, episodes, episodes_aired, status} = this.props.options;

		if(status == 'released')
			return watched + '/' + episodes;

		return watched + '/' + episodes_aired +' ('+(episodes <= 0 ? '?' : episodes)+ ')';
	}

	__goToView(onCurrent) {
		var {watched, episodes, id} = this.props.options;
		var episode = onCurrent == true
			? (watched > 0 ? watched : 1)
			: (watched < episodes ? watched + 1 : 1);

		window.open(todonimeURLMake(id, episode), '_blank');
	}

	__toNextEpisode() {
		this.__goToView(false);
	}

	__toCurrentEpisode() {
		this.__goToView(true);
	}

	onChangeSeries(e) {

	}

	makeWatchedSeries() {
		return (
			<span
				onClick={this.onChangeSeries.bind(this)}
				className="anime__footer-watched--series"
				title="Нажмите чтобы изменить."
			>
				{this.__getWatchedSeries()}
				{this.state.showEpisodesChanger
					? <Window>
							<input type="text" style={{width: '20px'}} defaultValue={this.props.options.watched} focus="true"/>
						</Window>
						: null}
			</span>);
	}

	makeRewatchButton() {
		return (
			<i onClick={this.__toCurrentEpisode.bind(this)}
				className="anime__manage play material-icons"
				title="Пересмотреть текущую"
			>replay</i>);
	}

	makeWatchButton() {
		var watched = this.props.options.watched;
		return (
			<i onClick={this.__toNextEpisode.bind(this)}
				className="anime__manage play material-icons"
				title={watched > 0 ? 'Смотреть дальше' : 'Начать просмотр'}
			>play_arrow</i>
		);
	}

	makeDetail() {
		return <Detail
			animeID={this.props.options.id}
			show={this.state.showDetail}
			onToggle={this.toggleDetail.bind(this)}
		/>
	}

	makeMyListChanger() {
		return <MylistChanger
			className="show-anime-hover"
			style={{flex: 1, maxHeight: '28px', margin: '0 10px 0 10px'}}
			title="Перенести в другой список"
			list={this.props.list}
			onChange={this.onChangeList.bind(this)}
		/>
	}

	makeFooter() {
		var {watched, episodes, episodes_aired, status, kind} = this.props.options;
		return (
			<div className="anime__footer">
				{status != 'anons' && (watched < episodes || watched < episodes_aired) ? this.makeWatchButton() : null}
				{watched > 0 ? this.makeRewatchButton() : null}
				{kind != 'movie' ? this.makeWatchedSeries() : null}
				<i className="material-icons show-anime-hover anime__manage play" title="Скопировать ссылку на серию">share</i>
				{this.makeMyListChanger()}
				{this.makeDetail()}
			</div>);
	}

	toggleBookmark() {
		if(!this.props.favoritable) add(this.props.options.id);
			else unset(this.props.options.id);
	}

	toggleDetail() {
		dispatch('toggleDetail', {
			type: (!this.state.showDetail ? 'show' : 'hide'),
			list: this.props.list,
			id: this.props.options.id,
			el: this.ref.current
		});

		this.setState({
			showDetail: !this.state.showDetail
		});
	}

	onChangeList(list) {
		this.props.onChangeList(list, this.props.options.rate_id);
	}

	onMouseOut(e) {
		const element = e.nativeEvent.relatedTarget;

		if(element == null) {
			if(this.state.showDetail) this.toggleDetail();
			return;
		}

		if(
			element.id != this.id
			&& element.closest('#' + this.id) == null
			&& this.state.showDetail
			&& process.env.DETAIL_ANIME_AUTOCLOSE)
		{
			this.toggleDetail();
		}
	}

	render() {
		var {image, russian, kind, url, status} = this.props.options;
		var domain = 'https://shikimori.one';
		return (
			<div
				onMouseOut={this.onMouseOut.bind(this)}
				className="anime__container"
				ref={this.ref}
				id={this.id}
			>
				<img className="anime__poster" src={domain + image.x96} />
				<a className="title" href={domain + url} target="_blank" title={russian}>{russian}</a>
				{this.props.useFavorites ? <Bookmark active={this.props.favoritable} toggle={this.toggleBookmark.bind(this)} /> : null}
				<Status status={status} /><br/>
				<Markers anime={this.props.options} />
				{this.makeFooter()}
			</div>
		);
	}
}
Anime.defaultProps = {
	favoritable: false
};
