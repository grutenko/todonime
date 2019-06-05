import React, { Component, Fragment } from "react";
import ReactDOM from 'react-dom';
import Loader from '../share/loader';

import * as AnimeModel from '../../lib/anime';
import * as Favorites from '../../lib/favorites';
import {compare} from '../../lib/compare';
import {subscribe, unsubscribe, dispatch} from '../../lib/event';

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
		this.state = this.__defaultState();
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

	componentDidMount() {
		this.getAnimes(true);

		$('#'+this.listID).scroll((e) => {
			var list = $(e.currentTarget);
			
			if(list.prop('scrollHeight') - list.scrollTop() <= 600
				&& !this.state.isLastPage
				&& this.state.loaded)
			{
				this.incrementPage();
			}
		});

		if(this.props.useFavorites)
			this.fvEventID = subscribe('favorites', () => this.forceUpdate());

		this.eventDetailID = subscribe('toggleDetail', (e) => {
			if(e.detail.type != 'show' || e.detail.list != this.props.list)
				return;

			if($('#' + this.listID).get(0).scrollTop >= e.detail.el.offsetTop - 260)
				return;

			$('#' + this.listID).animate({
				scrollTop: e.detail.el.offsetTop - 260
			}, 250);
		});

		this.eventChangeList = subscribe('changeList', (e) => {
			const {from, to} = e.detail;
			if([from, to].indexOf(this.props.list) == -1) return;

			this.updateStateWithLoader({
				page: DEF_PAGE
			}, true);
		})
	}

	componentWillUnmount() {
		$('#'+this.listID).off();
		if(this.props.useFavorites)
			unsubscribe(this.fvEventID);

		unsubscribe([this.eventDetailID, this.eventChangeList]);
	}

	componentDidUpdate(prevProps, prevState) {
		if(!this.state.loaded) {
			this.getAnimes(this.rewrite);
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
				case 'search': reset('search', null); break;
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
		const bookmarks = this.props.useFavorites
			? this.animes.filter(anime =>
					Favorites.exists(anime.id))
			: []

		const animes = this.props.useFavorites
			? this.animes.filter(anime =>
					!Favorites.exists(anime.id))
			: this.animes;

		return (
			<div style={{height: this.props.listHeight+'px'}} className="animes__list" id={this.listID}>
				{this.props.useFavorites && bookmarks.length > 0
					? this.makeBookmarksList(bookmarks)
					: null}
				{animes.map((anime, i) =>
						<Fragment key={i}>
							<Anime
								options={anime}
								useFavorites={this.props.useFavorites}
								list={this.props.list}
								onChangeList={this.onChangeList.bind(this)}
							/>
							{i % this.props.limit == 0 && i >= this.props.limit
								? <div className="hr-with-text">
										{Math.round(i / this.props.limit + 1)} страница
									</div>
								: null
							}
						</Fragment>
					)}
		</div>);
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
					? <div className="auth_required">
							<p>Нет ни одного аниме. ¯\_(ツ)_/¯</p>
							{(!compare(DEF_FILTER, filter) || search != '')
								? <button className="main__button" onClick={this.onCancel.bind(this)}>
										сбросить фильтры
									</button>
								: null}
						</div>
					: null}
			{this.makeList()}
		</div>);
	}
}

List.defaultProps = {
	list: 'planned',
	limit: 20,
	listHeight: 510,
	useFavorites: false
};