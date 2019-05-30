import React, { Component } from "react";
import ReactDOM from 'react-dom';

import Markers from './markers';
import Status from './status';
import Bookmark from './bookmark';
import Detail from './detail';
import MylistChanger from './my-list-changer';

import {add, unset} from '../../lib/favorites';
import {dispatch} from '../../lib/event';

export default class Anime extends Component {
	constructor(props) {
		super(props);
		this.state = {showDetail: false};
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

		window.open('https://todonime.space/video/'+id+'/'+episode, '_blank');
	}

	__toNextEpisode() {
		this.__goToView(false);
	}

	__toCurrentEpisode() {
		this.__goToView(true);
	}

	makeWatchedSeries() {
		return (
			<span className="anime__footer-watched--series">
				{this.__getWatchedSeries()}
			</span>);
	}

	makeRewatchButton() {
		return (
			<img onClick={this.__toCurrentEpisode.bind(this)}
				className="anime__manage play"
				src="/images/replay.png"
				title="Пересмотреть текущую"
			/>);
	}

	makeWatchButton() {
		var watched = this.props.options.watched;
		return (
			<img onClick={this.__toNextEpisode.bind(this)}
				className="anime__manage play"
		  	src="/images/play.png"
				title={watched > 0 ? 'Смотреть дальше' : 'Начать просмотр'}
			/>
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
			&& this.state.showDetail) 
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