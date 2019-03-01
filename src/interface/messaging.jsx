import React, { Component } from "react";
import ReactDOM from 'react-dom';
import API from '../model/api';
import {Loader, ButtonMore, ButtonBack, Search} from './misc.jsx';
import {WSAPI, authorize} from "../model/webSocketApi";
import DOMPurify from 'dompurify';

export class Dialogs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			dialogID: null
		};
		
		
		
		this.dialogs = [];
		this.wsapi = null;
	}
	
	__getDialogs() {
		API.getInstance().getDialogs().then((data) => {
			this.dialogs = data;
			this.setState(Object.assign(this.state, {
				loaded: true
			}));
		});
	}
	
	componentDidMount() {
		authorize().then((wsapi) => {
			this.wsapi = wsapi;
			this.__getDialogs();
		});
	}
	
	onSetDetail(id) {
		let targetUser;
		for(let i in this.dialogs) {
			if(this.dialogs[i].target_user.id == id) {
				targetUser = this.dialogs[i].target_user;
				break;
			}
		}
		
		this.setState(Object.assign(this.state, {
			dialogID: id,
			targetUser: targetUser
		}));
	}
	
	onUpdateSearch(text) {
		
	}
	
	showDialogs() {
		return (
			<div className="dialogs__list">
			{this.dialogs.map((e, i) => {
				return <DialogPreview 
						key={i}
						user={e.target_user}
						lastMessage={e.message}
						len="80"
						id={e.target_user.id}
						onClick={this.onSetDetail.bind(this)}
					/>
			})}
			</div>
		);
	}
	
	showMainList() {
		return (
			<div>
				<Search onUpdate={this.onUpdateSearch.bind(this)} />
				{this.state.loaded == false ? <Loader /> : null}
				{this.showDialogs()}
			</div>
		);
	}
	
	onBack() {
		this.setState(Object.assign(this.state, {
			dialogID: null
		}));
	}
	
	showDetailDialog() {
		return <DetailDialog
				onBack={this.onBack.bind(this)}
				limit="20"
				userData={this.state.targetUser}
				id={this.state.dialogID} />
	}
	
	render() {
		return this.state.dialogID == null
				? this.showMainList()
				: this.showDetailDialog();
	}
}

class DetailDialog extends Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		var user = API.getInstance().getCurrentUser();
		return (
			<div>
				<ButtonBack onClick={this.props.onBack} text="К списку диалогов"/>
				<UserPreview userData={this.props.userData} />
				<Messages myID={user.id} id={this.props.id} limit={this.props.limit}/>
				<AddMessageForm myID={user.id} dialogID={this.props.id} />
			</div>
		);
	}
}

const UserPreview = ({userData}) => {
	var onClick = function() {
		window.open("https://shikimori.org/"+userData.nickname,'_blank');
	}
	
	return (
		<div className="dialog__user-preview" onClick={onClick}>
			<img src={userData.image.x48} />
			<span>{userData.nickname}</span>
		</div>
	);
}

class Messages extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			showMore: true
		}
		
		this.messages = [];
		this.wsapi = WSAPI.getInstance();
		this.page = 1;
	}
	
	__getMessages() {
		API.getInstance().getDialogMessages({
			userID: this.props.id,
			limit: this.props.limit,
			page: this.page
		})
		.then((data) => {
			this.messages = data.reverse();
			this.setState({loaded: true});
			
			this.__scroll();
		})
	}
	
	__scroll() {
		$(".dialog__messages").scrollTop(
			$(".dialog__messages").prop('scrollHeight')
		);
	}
	
	componentDidMount() {
		this.wsapi.subscribe("/dialog-"+this.props.myID+"-"+this.props.id, (wdata) => {
			if(wdata.event != "message:created") return;
			
			API.getInstance()
				.getMessage(wdata.message_id)
				.then((data) => {
					this.messages.push(data);
					this.forceUpdate();
					
					this.__scroll();
				});
		});
		
		this.__getMessages();
	}
	
	onMore() {
		this.page += 1;
		
		API.getInstance().getDialogMessages({
			userID: this.props.id,
			limit: this.props.limit,
			page: this.page
		})
		.then((messages) => {
			if(messages.length < this.props.limit) {
				this.setState(Object.assign(this.state, {
					showMore: false
				}));
			}
			
			this.messages = messages
				.reverse()
				.concat(this.messages);
				
			this.forceUpdate();
		});
	}
	
	render() {
		return (
			<div className="dialog__detail dialog__messages">
				{this.state.loaded == false ? <Loader /> : null}
				{this.state.showMore ? <ButtonMore count={this.props.limit} onClick={this.onMore.bind(this)} /> : null}
				{this.messages.map((e, i) => <Message key={i} data={e} />)}
			</div>
		);
	}
}

class Message extends Component {
	constructor(props) {
		super(props);
		this.state = {
			read: props.read
		};
	}
	
	render() {		
		let user = API.getInstance().getCurrentUser();
		let myMess = this.props.data.from.id == user.id;
		
		let strTime = new Date(this.props.data.created_at).toUTCString();
		
		let styles = {textAlign: myMess ? "right" : "left"};
		var className = "dialog__message" + (myMess ? " my" : "");
		var containerClassName = !this.props.data.read ? "un-read" : "";
		
		return (
			<div className={containerClassName} style={styles}>
				<div className={className}>
					<div className="message_header">
						<time>{strTime}</time>
					</div>
					<div className="message_body" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(this.props.data.html_body)}}>
					</div>
				</div>
			</div>
		);
	}
}

class AddMessageForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sending: false
		};
	}
	
	onChange(e) {
		let text = $(e.currentTarget).val().trim();
		if(e.keyCode == 13 && text !== "") {
			$(e.currentTarget).val("");
			this.__send(text).then((data) => {
				this.setState({sending: false});
			});
		}
	}
	
	__send(text) {
		this.setState({sending: true});
		return API.getInstance().addMessage({
			frontend: false,
			message: {
				body: text,
				from_id: this.props.myID,
				kind: "Private",
				to_id: this.props.dialogID
			}
		});
	}
	
	render() {
		return (
			<div className="dialog__message-form">
				{this.state.sending ? <Loader /> : null}
				<textarea
					onKeyUp={this.onChange.bind(this)}
					className="message__form"
					placeholder="Топовое аниме посмотрел..."
				/>
			</div>
		);
	}
}

const DialogPreview = ({user, lastMessage, id, onClick, len}) => {
	var click = (e) => onClick(id);
	lastMessage.body = (lastMessage.body.length <= len
			? lastMessage.body
			: lastMessage.body.substr(0, len) + "...");
	
	return (
		<div onClick={click} className="dialog__container" data-id={id}>
			<img className="user__avatar" src={user.image.x80}/>
			<a className="dialog__name">{user.nickname}</a>
			<p>{lastMessage.body}</p>
		</div>
	);
}