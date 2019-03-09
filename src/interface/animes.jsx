import React, { Component } from "react";
import ReactDOM from 'react-dom';
import API from '../model/api';
import VK, {Share} from "react-vk";
import {Window} from './windows.jsx';
import {Loader, ButtonMore, Search, Tools} from './misc.jsx';

const __FULL_ANIME_TYPES__ = [
	{code: "tv", name: "Сериал"},
	{code: "movie", name: "Фильм"},
	{code: "ova", name: "OVA"},
	{code: "ona", name: "ONA"},
	{code: "special", name: "Спешл"},
	{code: "music", name: "Клип"}
];

const __FULL_ANIME_RATINGS__ = [
	{code: "g", name: "G"},
	{code: "pg_13", name: "PG-13"},
	{code: "r", name: "R-17"},
	{code: "r_plus", name: "R+"}
];

const __FULL_ANIME_DURATION__ = [
	{code: "S", name: "До 10 минут"},
	{code: "D", name: "До 30 минут"},
	{code: "F", name: "Более 30 минут"}
];

const __FULL_ANIME_EPISODES__ = [
	{code: "tv_13", name: "~13 серии"},
	{code: "tv_24", name: "~24 серии"},
	{code: "tv_48", name: "<48 серий"}
];

export class Animes extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			showMore: true,
			animes: [],
			filter: {},
			search: null
		};
		
		this.page = 0;
		this.searchFlag = false;
		
		this.__api = API.getInstance();
		this.cUser = this.__api.getCurrentUser();
	}
	
	__setRates(animes, rates) {
		return animes.map(anime => {
			for(let i in rates) {
				let rate = rates[i]
				if(rate.target_id != anime.id) continue;
				
				anime = Object.assign(anime, {
					watched: rate.episodes,
					score: rate.score,
				});
				
				break;
			}
			
			return anime;
		})
	}
	
	showAnimes(page, search, filter) {
		var __animes = [];
		filter = filter === undefined ? {} : filter;
		
		this.setState(Object.assign(this.state, {
			loaded: false
		}));
		
		this.__api.getAnimes(Object.assign({
			page: page,
			limit: this.props.limit,
			mylist: this.props.type,
			search: search || undefined
		}, filter))
		.then(animes => {
			__animes = animes;
			return this.__api.getUserRates({
				user_id: this.__api.getCurrentUser().id,
				target_type: "Anime",
				status: this.props.type
			})
		})
		.then(rates => {
			let animes = this.__setRates(__animes, rates);
			this.setState(Object.assign(this.state, {
				showMore: animes.length >= this.props.limit,
				animes: (page > 1 ? this.state.animes.concat(animes) : animes),
				loaded: true
			}))
		})
	}
	
	componentDidMount() {
		this.page += 1;
		this.showAnimes(this.page, this.state.search, this.state.filter);
	}
	
	onMoreAnimes() {
		this.page += 1;
		this.showAnimes(this.page, this.state.search, this.state.filter);
	}
	
	onUpdateSearch(text) {
		if(text == "" && this.state.search != null) {
			this.page = 1
			this.setState(Object.assign(this.state, {
				search: null
			}))
			this.showAnimes(this.page, null, this.state.filter);
			return;
		}
		
		this.page = 1;
		this.setState(Object.assign(this.state, {
			search: text
		}))
		this.showAnimes(this.page, text, this.state.filter);
	}
	
	createMainList() {
		return (
			<div className="animes__list">
			{this.state.animes.length > 0
				? this.state.animes.map((anime, i) => <Anime key={i} data={anime} />)
				: (<div className="auth_required"> <p>Нет ни одного аниме :(</p></div>)
			}
			{this.state.showMore
				? <ButtonMore count={this.props.limit} onClick={this.onMoreAnimes.bind(this)} />
				: null
			}
			</div>
		);
	}
	
	filtered(filter) {
		function getCode(filterSect, nullValue) {
			return filterSect.length > 0
						? filterSect.map(t => t.code).join(',')
						: nullValue;
		}
		
		if(filter == null) {
			var props = {};
		} else {
			var props = {
				kind: 		getCode(filter.type, undefined),
				rating: 	getCode(filter.rating, 'none'),
				episodes: 	getCode(filter.count_episodes, undefined),
				duration: 	filter.duration.code == 'all' ? undefined : filter.duration.code,
			}
		}
		
		this.page = 1;
		this.setState(Object.assign(this.state, {
			filter: props
		}));
		
		this.showAnimes(this.page, this.state.search, props);
	}
	
	render() {
		return (
			<div>
				<Tools>
					<Search onUpdate={this.onUpdateSearch.bind(this)} />
					<Filter onActive={this.filtered.bind(this)} />
				</Tools>
				{this.state.loaded == false ? <Loader /> : null}
				{this.createMainList()}
			</div>
		);
	}
}

class Filter extends Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
			filterData: null
		};
		
		this.filter = {
			type: __FULL_ANIME_TYPES__,
			count_episodes: __FULL_ANIME_EPISODES__,
			rating: __FULL_ANIME_RATINGS__,
			duration: {code: "all", name: "Все"}
		};
	}
	
	onClick() {
		this.setState(Object.assign(this.state, {
			open: this.state.open != true
		}));
	}
	
	onUpdate__Up(section) {
		return (data) => {
			this.filter[section] = data;
			this.forceUpdate();
		}
	}
	
	onCancel() {
		this.filter = {
			type: [],
			count_episodes: [],
			rating: [],
			duration: {code: "all", name: "Все"}
		};
		this.setState(Object.assign(this.state, {
			filterData: null
		}));
		this.props.onActive(null);
	}
	
	onSend() {
		this.setState(Object.assign(this.state,{
			open: false,
			filterData: this.filter
		}));
		
		this.props.onActive(this.filter);
	}
	
	createFilter() {
		var windowStyles = {
			right: "5px", 
			top: "85px", 
			width: "250px",
			height: "420px"
		};
		
		var contentStyles = {
			height: "380px"
		}
		
		var isSetSerial = this.filter.type.map(t => t.code).indexOf("tv") != -1;
		
		return (
			<Window
				title="Фильтр"
				contentStyles={contentStyles}
				onClose={this.onClick.bind(this)}
				style={windowStyles}
			>
				<AnimeFilterTypes elems={this.filter.type} onUpdate={this.onUpdate__Up('type')}/>
				{isSetSerial
					? <AnimeFilterSeries elems={this.filter.count_episodes} onUpdate={this.onUpdate__Up('count_episodes')} />
					: null
				}
				<AnimeFilterRating elems={this.filter.rating} onUpdate={this.onUpdate__Up('rating')}/>
				<AnimeFilterDuration value={this.filter.duration} onUpdate={this.onUpdate__Up('duration')}/>
				
				<br /><button className="main__button" onClick={this.onSend.bind(this)}>найти</button>
				<button className="main__button" onClick={this.onCancel.bind(this)}>сбросить</button>
			</Window>
		);
	}
	
	render() {
		return (
			<div style={{display: "inline-block", float: "right"}}>
				{this.state.filterData != null
					? <button className="main__button clear-filter" onClick={this.onCancel.bind(this)}>Сбросить</button>
					: null}
				{this.state.open ? this.createFilter() : null}
				<img 
					onClick={this.onClick.bind(this)}
					className="tools__button"
					src="/images/filter.svg"
					alt="Фильтр"
				/>
			</div>
		);
	}
}

class FilterSelect extends Component {
	constructor(props) {
		super(props);
		this.state = {
			types: this.props.elems
		}
		
		
		this.fullTypes = props.fullTypes;
		this.onUpdate = this.props.onUpdate;
	}
	
	componentDidUpdate(prevProps) {
		if(this.props.elems !== prevProps.elems) {
			this.setState(Object.assign(this.state, {
				types: this.props.elems
			}))
		}
	}
	
	onAdd(type) {
		this.setState(Object.assign(this.state, {
			types: this.state.types.concat([type])
		}));
		
		this.onUpdate(this.state.types);
	}
	
	addAll() {
		this.setState(Object.assign(this.state, {
			types: (this.state.types.length <  this.fullTypes.length ? this.fullTypes : [])
		}));
		
		this.onUpdate(this.state.types);
	}
	
	onRemove(rType) {
		this.setState(Object.assign(this.state, {
			types: this.state.types.filter(type => rType.code != type.code)
		}));
		
		this.onUpdate(this.state.types);
	}
	
	freeTypes() {
		let codes = this.state.types.map(type => type.code);
		return this.fullTypes.filter(type => codes.indexOf(type.code) == -1);
	}
	
	render() {
		return (
			<div className="filter__anime-types">
				{this.state.types.map((type, i) =>
					<AnimeFilterType key={i} type={type} onRemove={this.onRemove.bind(this)} />)}
				<FilterSelectAdd
					onAll={this.addAll.bind(this)}
					onAdd={this.onAdd.bind(this)}
					types={this.freeTypes()} 
					title={this.props.title}
				/>
			</div>
		);
	}
}

const FilterSelectAdd = ({onAdd, onAll, types, title}) => {
	function onChange(e) {
		let value = e.target.value;
		if(value == "__disable__") return;
		
		for(let i in types) if(types[i].code == value) onAdd(types[i]);
		$(e.target).val("__disable__");
	}
	
	var isAll = types.length == 0 // If free types == 0 then button "all" -> "delete all"
								  // See AnimeFilterTypes contructor 
	
	return (
		<div className="filter__anime-type new">
			<button onClick={onAll}>{isAll ? "Убрать все" : "Все"}</button>
			<select onChange={onChange}>
				<option value="__disable__">---{title}---</option>
				{types.map((type, i) => <option key={i} value={type.code}>{type.name}</option>)}
			</select>
		</div>
	);
}

const AnimeFilterTypes = (props) => {
	return (
		<div>
			<div style={{padding: "10px 0 0 10px"}}><b>Tип</b></div>
			<FilterSelect fullTypes={__FULL_ANIME_TYPES__} title="Тип" {...props}/>
		</div>
	);
}
	
const AnimeFilterRating = (props) => {
	return (
		<div>
			<div style={{padding:  "10px 0 0 10px"}}><b>Рейтинг</b></div>
			<FilterSelect fullTypes={__FULL_ANIME_RATINGS__} title="Рейтинг"  {...props}/>
		</div>
	);
}

const AnimeFilterSeries = (props) =>
	<div>
		<div style={{padding:  "10px 0 0 10px"}}><b>Количество серий</b></div>
		<FilterSelect fullTypes={__FULL_ANIME_EPISODES__} title="Серии" {...props}/>
	</div>

const AnimeFilterDuration = ({elems, onUpdate, ...props}) => {
	function onChange(e) {
		if(e.target.value == "__disable__") {
			onUpdate({code: "all", name: "Все"});
			return;
		}
	
		for(let i in __FULL_ANIME_DURATION__)
			if(__FULL_ANIME_DURATION__[i].code == e.target.value)
				onUpdate(__FULL_ANIME_DURATION__[i]);
	}
	
	return (
		<div>
			<div style={{padding: "10px 0 0 10px"}}><b>Длительность</b></div>
			<select onChange={onChange} style={{margin: "5px"}} {...props}>
				<option value="__disable__">--- Длительность ---</option>
				{__FULL_ANIME_DURATION__.map((d, i) =>
					<option key={i} value={d.code}>{d.name}</option>)}
			</select>
		</div>
	);
}
	
const AnimeFilterType = ({type, onRemove}) => {
	var closeStyles = {
		width: "10px",
		height: "10px",
		float: "right",
		padding: "5px",
		marginLeft: "5px",
		borderRadius: "5px",
		backgroundColor: "white"
	};
	
	function onClick() {
		onRemove(type);
	}
	
	return (
		<div className="filter__anime-type" data-code={type.code}>
			{type.name}
			<img src="/images/cancel.svg" style={closeStyles} onClick={onClick} />
		</div>);
}

const Anime = ({data}) => {
	return (
		<div className="anime__container" data-id={data.id}>
			<Poster imageSrc={data.image.x96} animeLink={data.url} />
			<a href={"https://shikimori.org" + data.url} target="_blank">{data.russian}</a><br/>
			<AnimeMarkers data={data} />
			<div className="anime__footer">
				<PlayButton url={data.url} watched={data.watched} full={data.episodes} />
				<WatchedSeries watched={data.watched} full={data.episodes} />
				<SearchGoogleButton name={data.russian} />
			</div>
		</div>
	);
}

const Poster = ({imageSrc, animeLink}) =>
	<a href={"https://shikimori.org" + animeLink} target="_blank">
		<img className="anime__poster" src={"https://shikimori.org" + imageSrc}/>
	</a>

const PlayButton = ({url, watched, full}) => {
	var onClick = () => {
		window.open('http://play.shikimori.org' + url + "/video_online/"
			+ (watched < full ? watched + 1 : 1), '_blank');
	}
	
	return (<img
		className="anime__manage play"
		style={{width: "24px", height: "24px"}}
		onClick={onClick}
		src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADmSURBVGhD7ZgxDkFBFEV/FFq1DVBq7cEudBbAKizCLmyBNehtQKXBfXjJL8j4jJm5k3uSk4juJN81fxohhBBCiDsTOHx85GYBT3AJ+/YFKxZyfXqAM0hJO8TdwhGk4lWIeYZrOIAUvAtxj3AOe7BoQiHuDk5hsXwaYl7gBhY5111CXJvrFSxqrr8JcYua619CXJvrMcxKjBAz+1zHCnGzzXXsEHcPk871v0LMpHOtkID0jxb9j72K+aX/Q6Q/otAfGqs4xief066EQuhfdau4fKC/DqK/oKviyrSaS2whhBBClEXT3ABwdWr/VC9KZwAAAABJRU5ErkJggg=="
	/>);
	
}
	
const SearchGoogleButton = ({name}) =>
	<a
		href={"https://google.com/search?hl=ru&q="+name}
		target="_blank"
	>
		<img src="https://img.icons8.com/color/24/000000/google-logo.png"
			alt="Искать название в Google"/>
	</a>
	
const WatchedSeries = ({watched, full}) => 
	<span className="anime__footer-watched--series">
		{watched + "/" + full}
	</span>

const AnimeMarkers = ({data}) => {
	var props = [
			{name: "kind", color: "green", type: "Тип"},
			{name:"released_on", color:"#484869", type: "Релиз"} ,
			{name:"episodes", color:"blue", type: "Серий"}
		];
	
	return (
		<div className="anime__markers-container">
		{
			props.map((value, i) =>
				(data[value.name] != null
					? <AnimeMarker key={i} marker={value} data={data[value.name]} />
					: null)
			)
		}
		</div>
	);
}

const AnimeMarker = ({marker, data}) =>
	<div className="anime__marker" style={{background: marker.color, color: "white"}}>
		{marker.type + ": " + data}
	</div>