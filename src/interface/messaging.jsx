import React, { Component } from "react";
import ReactDOM from 'react-dom';
import API from '../model/api';
import {Loader, ButtonMoreMessages, ButtonBack, Search, Tools} from './misc.jsx';
import {WSAPI, authorize} from "../model/webSocketApi";
import {Window} from "./windows.jsx";
import DOMPurify from 'dompurify';

export class Dialogs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			dialogID: null,
			updateListAfterDetail: false
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
	
	__searchTarget(userID) {
		for(let i in this.dialogs) {
			if(this.dialogs[i].target_user.id != userID) continue;
			return this.dialogs[i].target_user;
		}
	}
	
	onSetDetail(id, user) {
		let targetUser = (user === undefined
				? this.__searchTarget(id)
				: user);
		
		this.setState(Object.assign(this.state, {
			dialogID: id,
			targetUser: targetUser,
			updateListAfterDetail: user !== undefined 
		}));
	}
	
	createDialog( user ) {
		this.onSetDetail(user.id, user);
	}
	
	showDialogs() {
		return (
			<div>
				<ToolBox
					onCreate={this.createDialog.bind(this)}
					dialogs={this.dialogs}
				/>
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
			</div>
		);
	}
	
	showMainList() {
		return (
			<div>
				{this.state.loaded == false ? <Loader /> : null}
				{this.showDialogs()}
			</div>
		);
	}
	
	onBack() {
		var mustUpdateList = this.state.updateListAfterDetail;
		
		this.setState(Object.assign(this.state, {
			dialogID: null,
			updateListAfterDetail: false
		}));
		
		/*
		If mustUpdateList == true then we should update from server list of dialogs.
		For showing new dialogs
		*/
		if(mustUpdateList) this.componentDidMount();
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

const DetailDialog = ({onBack, userData, id, limit}) => {
	var cUser = API.getInstance().getCurrentUser();
	return (
		<div>
			<ButtonBack onClick={onBack} text="К списку диалогов"/>
			<UserPreview userData={userData} />
			<Messages myID={cUser.id} id={id} limit={limit}/>
			<AddMessageForm myID={cUser.id} dialogID={id} />
		</div>
	);
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

const ToolBox = ({onCreate, dialogs}) =>
	<Tools style={{textAlign: "right"}}>
		<DialogCreator dialogs={dialogs} onCreate={onCreate}/>
	</Tools>
	
class DialogCreator extends Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
			userID: null
		};
	}
	
	onChose(user) {
		this.setState(Object.assign(this.state, {
			userID: user.id
		}));
		
		this.props.onCreate(user);
	}
	
	createWindow() {
		var windowStyles = {
			right: "5px", 
			top: "85px", 
			width: "250px",
			height: "100px"
		};
		
		return (
			<Window
				title="Новый диалог"
				contentStyles={{}}
				onClose={this.onClick.bind(this)}
				style={windowStyles}
			>
				<FriendsListMinify
					onChose={this.onChose.bind(this)}
					dialogs={this.props.dialogs}
				/>
			</Window>
		);
	}
	
	onClick() {
		this.setState(Object.assign(this.state, {
			open: !this.state.open
		}))
	}
	
	render() {
		return (
			<span>
				<img
					onClick={this.onClick.bind(this)}
					className="tools__button"
					src="/images/plus.svg"
					alt="Создать диалог"
				/>
				{this.state.open ? this.createWindow() : null}
			</span>
		);
	}
}

class FriendsListMinify extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			users: []
		}
		
		this.__api = API.getInstance();
		this.cUser = this.__api.getCurrentUser();
	}
	
	componentDidMount() {
		var dialogIDs = this.props.dialogs.map(d => d.target_user.id); // Existing for this user dialogs
		this.__api.getUserFriends(this.cUser.id, {})
		.then(users => {
			this.setState({
				loaded: true,
				users: users.filter(u => dialogIDs.indexOf(u.id) == -1)
			});
			
			$('.users__list').one('click', '.users__list--user', (e) => {
				var users = this.state.users;
				var cDialogID = $(e.currentTarget).attr('data-id');
				
				for(let i in users) {
					if(users[i].id != cDialogID)
						continue;
					
					this.props.onChose(users[i]);
					break;
				}
			})
		});
	}
	
	render() {
		return (
			<div className="users__list minify">
			{this.state.loaded == false ? <Loader /> : null}
			{this.state.users.map((u, i) => <MUser key={i} data={u} />)}
			</div>
		);
	}
}

const MUser = ({data}) =>
	<div className="users__list--user" data-id={data.id}>
		<span>{data.nickname}</span>
		<img src={data.image.x32} className="users__list--avatar"/>
	</div>

class Messages extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			messages: [],
			showMore: true
		}
		
		this.page = 1;
		this.__api = API.getInstance();
		this.__wsapi = WSAPI.getInstance();
	}
	
	__getMessages(page) {
		return this.__api.getDialogMessages({
			userID: this.props.id,
			limit: this.props.limit,
			page: page
		}).then(messages => {
			let unreaded = messages.filter(
				m => m.from.id == this.props.id && !m.read);
				
			this.readMessages(unreaded.map(m => m.id));
			return messages.reverse()
		})
	}
	
	__getMessage(mID) {
		return this.__api.getMessage(mID).then(message => {
			if(message.from.id == this.props.id) this.readMessages([mID]);
			return message;
		})
	}
	
	__subscribe(userID, callback) {
		let cUserID = this.__api.getCurrentUser().id;
		this.__wsapi.subscribe("/dialog-" + cUserID + "-" + userID, callback);
	}
	
	scroll() {
		$(".dialog__messages").scrollTop(
			$(".dialog__messages").prop('scrollHeight')
		);
	}
	
	readMessages(IDs) {
		this.__api.readMessages({
			ids: IDs.join(','),
			is_read: '1'
		})
		.then(() => {
			this.setState(Object.assign(this.state, {
				// Mark read this messages
				messages: this.state.messages.map(m => {
					if(IDs.indexOf(m.id) != -1) m.read = true;
					return m;
				})
			}));
		});
	}
	
	componentDidMount() {
		this.__getMessages(this.page).then(messages => {
			this.setState(Object.assign(this.state, {
				loaded: true,
				showMore: messages.length >= this.props.limit,
				messages: messages
			}));
			this.scroll();
		});
		
		this.__subscribe(this.props.id, event => {
			if(event.event != "message:created") return;
			this.__getMessage(event.message_id).then(message => {
				this.setState(Object.assign(this.state, {
					messages: this.state.messages.concat([message])
				}));
				this.scroll();
			})
		});
	}
	
	onMore() {
		this.page += 1;
		this.__getMessages(this.page).then(messages => {
			this.setState(Object.assign(this.state, {
				showMore: messages.length >= this.props.limit,
				messages: messages.concat(this.state.messages)
			}));
		})
	}
	
	render() {
		return (
			<div className="dialog__detail dialog__messages">
				{this.state.loaded == false
					? <Loader />
					: null}
				{this.state.showMore ?
					<ButtonMoreMessages
						count={this.props.limit}
						onClick={this.onMore.bind(this)}
					/>
					: null}
				{this.state.messages.length == 0
					? <div className="auth_required">
						Напишите первое сообщение что бы создать диалог
					  </div>
					: null}
				{this.state.messages.map((e, i) => <Message key={i} data={e} />)}
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

const DialogToolbox = ({onDelete, data}) => {
	return (
		<div className="dialog__toolbox">
			<img src="/images/cancel.svg" onClick={() => onDelete(data.id)}/>
		</div>
	);
}