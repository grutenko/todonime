import React, { Component } from "react";
import ReactDOM from 'react-dom';

import Markers from './markers';
import Status from './status';
import Bookmark from './bookmark';
import Detail from './detail';
import Share from './share';
import MylistChanger from './my-list-changer';
import Window from '../share/windows';
import {todonimeURLMake} from '../../lib/url-maker';

import {add, unset} from '../../lib/favorites';
import * as Settings from '../../lib/settings';
import {dispatch} from '../../lib/event';

import {updateRate} from '../../lib/anime';

export default class Anime extends Component {
	constructor(props) {
		super(props);

		this.id = 'anime-' + this.props.options.id;
		this.ref = React.createRef();

		this.state = {
			showDetail: false,
			showEpisodesChanger: false,
			isNewEpisode: this.__ongoingNewEpisode(),
			playedTab: null,
			disabled: false
		};

		this.onMouseOut = this.onMouseOut.bind(this);
		this.onChangeSeries = this.onChangeSeries.bind(this);
		this.__toCurrentEpisode = this.__toCurrentEpisode.bind(this);
		this.__toNextEpisode = this.__toNextEpisode.bind(this);
		this.onChangeList = this.onChangeList.bind(this);
		this.toggleDetail = this.toggleDetail.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.onEpisodeDecrement = this.onEpisodeDecrement.bind(this);
		this.onEpisodeInrement = this.onEpisodeIncrement.bind(this);
	}

	componentWillMount() {
		this.isPlayed((played) => {
			this.setState({playedTab:played});
		});
	}

	__ongoingNewEpisode() {
		const anime = this.props.options;
		const key = this.id + '_lastEpisode';

		if(anime.status != 'ongoing')
			return false;

		if(!Settings.exists(key))
			Settings.set(key, anime.episodes_aired);

		const isNew = Settings.get(key) < anime.episodes_aired;
		Settings.set(key, anime.episodes_aired);

		return isNew;
	}

	__getWatchedSeries() {
		var {
			watched,
			episodes,
			episodes_aired,
			status
		} = this.props.options;

		if(status == 'released') return watched + '/' + episodes;
		return watched + '/' + episodes_aired +' ('+(episodes <= 0 ? '?' : episodes)+ ')';
	}

	__goToView(onCurrent, returnUrl) {
		var {watched, episodes, id} = this.props.options;
		var episode = onCurrent
			? (watched > 0 ? watched : 1)
			: (watched < episodes ? watched + 1 : 1);

		returnUrl = returnUrl || false;

		if(!returnUrl) {
			window.open(
				todonimeURLMake(id, episode),
				'_blank'
			);
		}else {
			return todonimeURLMake(id, episode);
		}
	}

	__toNextEpisode() {
		this.__goToView(false);
	}

	__toCurrentEpisode() {
		this.__goToView(true);
	}

	onChangeSeries(e) {
		this.setState({
			showEpisodeChanger: !this.state.showEpisodeChanger
		});
	}

	onEpisodeDecrement() {
		const anime = this.props.options;

		if(anime.watched == 0) return;

		this.setState({
			disabled: false
		});

		updateRate(anime.rate_id, {
			episodes: anime.watched - 1
		})
		.then(() => {
			this.props.options.watched = anime.watched - 1;
			this.setState({disabled: false});
		})
	}

	onEpisodeIncrement() {
		const anime = this.props.options;

		if(anime.watched == (anime.episodes_aired || anime.episodes))
			return;

		this.setState({
			disabled: false
		});

		updateRate(anime.rate_id, {
			episodes: anime.watched + 1
		})
		.then(() => {
			this.props.options.watched = anime.watched + 1;
			this.setState({disabled: false});
		})
	}

	makeWatchedSeries() {
		const  {
			showEpisodesChanger
		} = this.state;

		const {
			watched
		} = this.props.options;

		return (
			<span
				onClick={this.onChangeSeries}
				className="anime__footer-watched--series"
				title="Нажмите чтобы изменить."
			>
				<img
					className="anime__min-toolbox-but show-anime-hover"
					src="/images/minus-math.png"
					onClick={this.onEpisodeDecrement}
				/>
				{this.__getWatchedSeries()}
				{showEpisodesChanger
					? <input
							type="text"
							style={{width: '20px'}}
							defaultValue={watched}
							focus="true"
						/>
					: null}
				<img
					className="anime__min-toolbox-but show-anime-hover"
					src="/images/plus-math.png"
					onClick={this.onEpisodeInrement}
				/>
			</span>);
	}

	makeRewatchButton() {
		return (
			<i onClick={this.__toCurrentEpisode}
				className="anime__manage play material-icons"
				title="Пересмотреть текущую"
			>
				replay
			</i>);
	}

	makeWatchButton() {
		var {watched} = this.props.options;
		return (
			<i onClick={this.__toNextEpisode}
				className="anime__manage play material-icons"
				title={watched > 0 ? 'Смотреть дальше' : 'Начать просмотр'}
			>
				play_arrow
			</i>
		);
	}

	makeDetail() {
		return <Detail
			animeID={this.props.options.id}
			show={this.state.showDetail}
			onToggle={this.toggleDetail}
		/>
	}

	makeMyListChanger() {
		return <MylistChanger
			className="show-anime-hover"
			style={{flex: 1, maxHeight: '28px', margin: '0 10px 0 10px', fontSize: '11px'}}
			title="Перенести в другой список"
			list={this.props.list}
			onChange={this.onChangeList}
		/>
	}

	makeFooter() {
		const {
			id,
			watched,
			episodes,
			episodes_aired,
			status,
			kind
		} = this.props.options;

		return (
			<div className="anime__footer">
				{status != 'anons' && (watched < episodes || watched < episodes_aired)
					? this.makeWatchButton()
					: null}
				{watched > 0
					? this.makeRewatchButton()
					: null}
				{kind != 'movie'
					? this.makeWatchedSeries()
					: null}
				{this.makeMyListChanger()}
				{this.makeDetail()}
			</div>);
	}

	toggleBookmark() {
		if(!this.props.favoritable)
			add(this.props.options.id);
		else
			unset(this.props.options.id);
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

	isPlayed(callback) {
		const {id} = this.props.options;

		chrome.tabs.query(
			{url: 'https://todonime.ru/video/'+id+'/*'},
			(tabs) => {
				callback(tabs[0] || null)
			}
		)
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

	onDragStart(e) {
		e.dataTransfer.effectAllowed='move';
		e.dataTransfer.setData('animeId', this.props.options.id);
		e.dataTransfer.setData('animeList', this.props.list);
	}

	onDrop(e) {
		console.log(e);
	}

	onActivePlayerTab() {
		if(this.state.playedTab == null)
			return;

		chrome.tabs.update(
			this.state.playedTab.id, {active: true});
	}

	makeHeader() {
		const {
			useFavorites,
			favoritable,
			options
		} = this.props;

		const {
			image,
			russian,
			name,
			kind,
			url,
			status
		} = options;

		const domain = 'https://shikimori.one';

		return <div class="anime__header">
			<a
				className="title"
				href={domain + url}
				target="_blank"
				title={russian || name}
			>
				{russian || name}
			</a>
			{useFavorites
				? <Bookmark
						active={favoritable}
						toggle={this.toggleBookmark.bind(this)}
					/>
				: null}
			<Status status={status} />
		</div>
	}

	render() {
		const {
			useFavorites,
			favoritable,
			options
		} = this.props;

		const {
			image,
			russian,
			kind,
			url,
			status
		} = options;

		const domain = 'https://shikimori.one';

		const containerClassName = "anime__container"
			+ (this.state.disabled ? ' disabled' : '');

		return (
			<div
				onMouseOut={this.onMouseOut.bind(this)}
				className={containerClassName}
				href={this.__goToView(true, true)}
				ref={this.ref}
				id={this.id}
				onDragStart={this.onDragStart}
				onDrop={this.onDrop.bind(this)}
				draggable="true"
			>
				<img className="anime__poster" src={domain + image.x96} />
				{this.makeHeader()}
				<Markers anime={options} />
				{this.makeFooter()}
			</div>
		);
	}
}
Anime.defaultProps = {
	favoritable: false
};
