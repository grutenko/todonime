import React, { Component, Fragment } from "react";
import ReactDOM from 'react-dom';
import Loader from '../share/loader';

import PNotify from 'pnotify/dist/es/PNotify';
import PNotifyButtons from 'pnotify/dist/es/PNotifyButtons';

import * as AnimeModel from '../../lib/anime';
import * as Favorites from '../../lib/favorites';
import {compare} from '../../lib/compare';
import {subscribe, unsubscribe, dispatch} from '../../lib/event';
import {shikimoriURLMake} from '../../lib/url-maker';
import {get, set} from '../../lib/settings';

import Anime from './item';
import Search from '../share/search';
import Sort from './sort';
import Filter from './filter';

const DEF_SORT = 'ranked';
const DEF_LIMIT = 20;
const DEF_PAGE = 1;
const DEF_FILTER = {
	kind: AnimeModel.KIND.map(i => i.code),
	rating: AnimeModel.RATING.map(i => i.code),
};

export default class List extends Component {
	constructor(props) {
		super(props);
		this.state = this.__defaultState(
			get('tabState_'+this.props.list)
		);

		this.animes = [];
		this.listID = "list__"+ Math.floor(Math.random() * 1000);
		this.rewrite = true;

		this.applyFilter = this.applyFilter.bind(this);
		this.applySorting = this.applySorting.bind(this);
		this.applySearch = this.applySearch.bind(this);
	}

	/**
	 * The method updates the state of the component and sets the value of loaded as false.
	 * This is necessary to show the loader and send ajax request for data. Look at the
	 * componentDidUpdate() method for details.
	 *
	 * @param  {object} state Object with state data to be changed
	 * @param  {boolean} state If true - current anime list rewrited else added to end.
	 */
	updateStateWithLoader(state, rewrite) {
		var stateFields = Object.assign({loaded: false}, state);

		this.rewrite = (rewrite == undefined ? true : rewrite);
		this.setState(Object.assign(this.state, stateFields));
	}

	/**
	 * The method returns the component to its original state, while adding values ​​from the
	 * state parameter. Required for example to reset the filter and sort when searching.
	 *
	 * @param {object} state Object with state data to be changed
 	 * @param  {boolean} state If true - current anime list rewrited else added to end.
	 */
	resetStateWith(state, rewrite) {
		this.rewrite = (rewrite == undefined ? true : rewrite);
		this.setState(this.__defaultState(state || {}));
	}

	shouldComponentUpdate(nextProps) {
		/**
		 * - Optimization
		 * "active" prop provide activing current tab. If tab not active then
		 * no need to update this component
		 */
		return nextProps.active;
	}

	__defaultState(withValues) {
		this.rewrite = true;

		return Object.assign({
			loaded		: false,
			sort 			: DEF_SORT,
			limit 		: this.props.limit,
			page 			: DEF_PAGE,
			isLastPage: false,
			search 		: null,
			filter 		: Object.assign({}, DEF_FILTER)
		}, withValues || {});
	}

	__subscribeFavorites() {
		return subscribe('favorites', ({detail}) => {
			const ids = this.animes.map(anime => anime.id);
			if(detail.ids.every(id => ids.indexOf(id) != -1))
				this.forceUpdate();
		});
	}

	__subscribeScrollPagination() {
		$('#'+this.listID).scroll((e) => {
			var list = $(e.currentTarget);

			if(list.prop('scrollHeight') - list.scrollTop() <= 600
				&& !this.state.isLastPage
				&& this.state.loaded)
			{
				this.incrementPage();
			}
		});
	}

	__subscribeToggleDetail() {
		return subscribe('toggleDetail', (e) => {
			if(e.detail.type != 'show' || e.detail.list != this.props.list)
				return;

			if($('#' + this.listID).get(0).scrollTop >= e.detail.el.offsetTop - 260)
				return;

			$('#' + this.listID).animate({
				scrollTop: e.detail.el.offsetTop - 260
			}, 250);
		});
	}

	__subscribeChangeList() {
		subscribe('changeList', (e) => {
			const {from, to} = e.detail;
			if([from, to].indexOf(this.props.list) == -1)
				return;

			this.updateStateWithLoader({
				page: DEF_PAGE
			}, true);
		})
	}

	componentDidMount() {
		if(this.props.active)
			this.getAnimes(true);

		this.listeners = [
			(this.props.useFavorites ? this.__subscribeFavorites() : undefined),
			this.__subscribeToggleDetail(),
			this.__subscribeChangeList()
		];

		this.__subscribeScrollPagination();
	}

	componentWillUnmount() {
		$('#'+this.listID).off();
		unsubscribe(this.listeners);
	}

	componentDidUpdate(prevProps, prevState) {
		if(!this.state.loaded) {
			this.getAnimes(this.rewrite);

			const {filter, sort, search} = this.state;
			set('tabState_'+this.props.list, {
				filter, sort, search
			});
		}
	}

	getAnimes(rewrite) {
		const {sort, limit, page, filter, search} = this.state;

		AnimeModel.getList(
			this.props.list,
			sort,
			filter,
			limit,
			page,
			search
		).then(animes => {
			this.animes = rewrite
				? animes
				: this.animes.concat(animes);

			this.setState({
				loaded: true,
				isLastPage: animes.length < this.props.limit
			})
		});
	}

	applyFilter(filter) {
		this.updateStateWithLoader({
			filter,
			page: DEF_PAGE
		});
	}

	applySorting(sort) {
		this.updateStateWithLoader({
			sort: sort,
			page: DEF_PAGE
		});
	}

	applySearch(q) {
		this.updateStateWithLoader({
			search: q,
			page: DEF_PAGE
		});
	}

	onReset(key) {
		return () => {
			var reset = (k, v) => {
				let newFields = {loaded: false};
				newFields[k] = v;
				this.rewrite = true;
				this.setState(Object.assign(this.state, newFields));
			}

			switch(key) {
				case 'search':
					/**
					 * - Optimization
					 * If current search not setted then update state is no need to update.
					 */
					if(this.state.search != null)
						reset('search', null);
				break;
				default: return;
			}
		}
	}

	incrementPage() {
		this.updateStateWithLoader({
			page: this.state.page + 1
		}, false);
	}

	resetState() {
		this.resetStateWith();
	}

	onCancel() {
		this.resetStateWith({}, true);
	}

	onClearBookmarks() {
		Favorites.unset(
			this.animes.filter(anime => Favorites.exists(anime.id))
				.map(anime => anime.id)
		);
	}

	makeBookmarksList(animes) {
		return (
			<div className="favorites__list">
				<div style={{display: 'flex', padding: "10px 10px 5px 10px", color: 'white'}}>
					<span style={{flex: 1}}>Закладки</span>
					<img
						onClick={this.onClearBookmarks.bind(this)}
						className="tools__button small"
						src="/images/cancel.svg"
						title="Очистить закладки"
					/>
				</div>
				{animes.map((anime, i) =>
					<Anime
						key={i}
						options={anime}
						favoritable="true"
						useFavorites="true"
						list={this.props.list}
						onChangeList={this.onChangeList.bind(this)}
					/>)}
			</div>
		);
	}

	makeList() {
		const {filter, search} = this.state;
		const {listHeight, useFavorites, list, limit} = this.props;

		const bookmarks = useFavorites
			? this.animes.filter(anime =>
					Favorites.exists(anime.id))
			: []

		const animes = useFavorites
			? this.animes.filter(anime =>
					!Favorites.exists(anime.id))
			: this.animes;

		return (
			<div style={{height: listHeight+'px'}} className="animes__list" id={this.listID}>
				{(!compare(DEF_FILTER, filter) || search != null)
					? this.makeButtonsForEmptyList()
					: null}
				{useFavorites && bookmarks.length > 0
					? this.makeBookmarksList(bookmarks)
					: null}
				{animes.map((anime, i) =>
						<Fragment key={i}>
							<Anime
								options={anime}
								useFavorites={useFavorites}
								list={list}
								onChangeList={this.onChangeList.bind(this)}
							/>
							{i % limit == 0 && i >= limit
								? <div className="hr-with-text">{Math.round(i / limit + 1)} страница</div>
								: null
							}
						</Fragment>
					)}
		</div>);
	}

	searchOnShiki() {
		const {search, sort, filter} = this.state;
		const url = shikimoriURLMake(search, sort,
				(!compare(DEF_FILTER, filter) ? filter : null));

		window.open(url, '_blank');
	}

	makeButtonsForEmptyList() {
		return (
			<div className="auth_required"><p>
				<button className="main__button" onClick={this.onCancel.bind(this)}>
					сбросить
				</button>
				<button className="main__button" onClick={this.searchOnShiki.bind(this)}>
					искать на шикимори
				</button>
			</p></div>);
	}

	onChangeList(list, id) {
		AnimeModel.updateRate(id, {
			status: list
		})
		.then(() => {
			dispatch('changeList', {
				from: this.props.list,
				to: list,
				id
			});

			PNotify.success({
		    text: "Аниме перенесено в другой список",
		    addClass: 'z-indx-top b-white',
		    width: '250px',
		    minHeight: '32px',
		    delay: 1500
		  });
		});
	}

	render() {
		const {filter, search} = this.state;

		return (<div>
			<div className="filter">
				<Search onApply={this.applySearch} onReset={this.onReset('search')} q={search}/>
				<div style={{display: 'inline-block', float: 'right'}}>
					<Sort onApply={this.applySorting} onReset={this.onReset('sort')} active={this.state.sort}/>
					<Filter onApply={this.applyFilter} onReset={this.onReset('filter')} define={this.state.filter}/>
				</div>
			</div>
			{!this.state.loaded
				? <Loader />
				: this.animes.length == 0
					? <div className="auth_required"><p>Нет ни одного аниме. ¯\_(ツ)_/¯</p></div>
					: null}
			{this.makeList()}
		</div>);
	}
}

List.defaultProps = {
	list: 'planned',
	limit: 20,
	listHeight: 500,
	useFavorites: false
};
