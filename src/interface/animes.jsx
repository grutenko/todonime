import React, { Component } from "react";
import ReactDOM from 'react-dom';
import API from '../model/api';
import {Loader, ButtonMore, Search} from './misc.jsx';

export class Animes extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			limitedAnimes: true,
			type: props.type,
			searching: false
		};
		
		this.limit = props.limit;
		this.page = 0;
		this.searchText = props.search;
		this.animes = [];
	}
	
	__request(params) {
		var api = API.getInstance();
		this.page += 1;
		
		return api.getUserRates(api.getCurrentUser().id, {
			limit: 5000,
			status: this.state.type
		})
		.then(rates => {
			return api.getAnimes(Object.assign({
					mylist: this.state.type,
					user_id: api.getCurrentUser().id,
					limit: this.limit,
					page: this.page
				}, params
			))
			.then(animes => {
				return {animes, rates}
			});
		})
		.then(({animes, rates}) => this.__addAnimeRates(animes, rates));
		
	}
	
	__addAnimeRates(animes, rates) {
		for(let i in animes)
			for(let j in rates)
				if(rates[j].anime.id == animes[i].id) {
					animes[i] = Object.assign(animes[i], {
						watched_series: rates[j].episodes,
						status: rates[j].status,
					});
					break;
				}
				
		return animes;
	}
	
	getAnimes(params, callback) {
		this.setState(Object.assign(this.state, {
			loaded: false
		}));
		
		this.__request(params).then((data) => {
			callback(data);
			var newState = {
				loaded: true,
				limitedAnimes: data.length >= this.limit,
				searching: params.searching || false
			};
				
			this.setState(Object.assign(this.state, newState));
		});
	}
	
	componentDidMount() {
		this.page = 0;
		
		this.getAnimes({}, (data) => {
			this.animes = this.animes.concat(data);
		});
	}
	
	onUpdateSearch(text) {
		if(text == "" && !this.state.searching) return;
		
		this.page = 0;
		
		if(text == "" && this.state.searching) {
			this.getAnimes({searching: false}, (data) => {
				this.animes = data
			});
			return;
		}
		
		this.getAnimes({search: text, searching: true}, (data) => {
			this.animes = data;
		});
	}
	
	onMoreAnimes() {
		this.getAnimes({}, (data) => {
			this.animes = this.animes.concat(data);
		});
	}
	
	createMainList() {
		return (
			<div className="animes__list">
			{this.animes.length > 0
				? this.animes.map((anime, i) => <Anime key={i} data={anime} />)
				: (<div className="auth_required">
					<p>Нет ни одного аниме :(</p>
				</div>)
			}
			{
				this.state.limitedAnimes
					? <ButtonMore
						count={this.limit}
						onClick={this.onMoreAnimes.bind(this)} />
					: null
			}
			</div>
		);
	}
	
	render() {
		return (
			<div>
				<Search onUpdate={this.onUpdateSearch.bind(this)} />
				{this.state.loaded == false ? <Loader /> : null}
				{this.createMainList()}
			</div>
		);
	}
}

class Anime extends Component {
	constructor(props) {
		super(props);
	}
	
	onPlay() {
		let currentEpisode = (this.props.data.watched_series < this.props.data.episodes
				? this.props.data.watched_series + 1
				: 1);
		
		window.open('http://play.shikimori.org'
			+this.props.data.url + "/video_online/"+ currentEpisode,'_blank');
	}
	
	render() {
		var data = this.props.data;
		
		return (
			<div className="anime__container" data-id={data.id}>
				<a href={"https://shikimori.org" + data.url} target="_blank">
					<img className="anime__poster" src={"https://shikimori.org" + data.image.x96}/>
				</a>
				<a href={"https://shikimori.org" + data.url} target="_blank">
					{data.russian}
				</a><br/>
				<AnimeMarkers animeData={data} />
				<div className="anime__footer">
					<img
						className="anime__manage play"
						style={{width: "24px", height: "24px"}}
						onClick={this.onPlay.bind(this)}
						src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADmSURBVGhD7ZgxDkFBFEV/FFq1DVBq7cEudBbAKizCLmyBNehtQKXBfXjJL8j4jJm5k3uSk4juJN81fxohhBBCiDsTOHx85GYBT3AJ+/YFKxZyfXqAM0hJO8TdwhGk4lWIeYZrOIAUvAtxj3AOe7BoQiHuDk5hsXwaYl7gBhY5111CXJvrFSxqrr8JcYua619CXJvrMcxKjBAz+1zHCnGzzXXsEHcPk871v0LMpHOtkID0jxb9j72K+aX/Q6Q/otAfGqs4xief066EQuhfdau4fKC/DqK/oKviyrSaS2whhBBClEXT3ABwdWr/VC9KZwAAAABJRU5ErkJggg=="
					/>
					<span className="anime__footer-watched--series">
					{this.props.data.watched_series + "/" + this.props.data.episodes}
					</span>
					<a
						href={"https://google.com/search?hl=ru&q="+data.russian}
						target="_blank"
					>
						<img src="https://img.icons8.com/color/24/000000/google-logo.png"
								alt="Искать название в Google"/>
					</a>
				</div>
			</div>
		);
	}
}

const AnimeMarkers = ({animeData}) => {
	var props = [
			{name: "kind", color: "green", type: "Тип"},
			{name:"released_on", color:"#484869", type: "Релиз"} ,
			{name:"episodes", color:"blue", type: "Серий"}
		];
	
	var data = animeData;
	return (
		<div className="anime__markers-container">
		{
			props.map((value) =>
				(data[value.name] != null
					?(<div
						key={value.name}
						className="anime__marker"
						style={{background: value.color, color: "white"}}
					  >
						{value.type + ": " + data[value.name]}
					  </div>)
					: null)
			)
		}
		</div>
	);
}