import React, { Component } from "react";
import ReactDOM from 'react-dom';

import AutoCloseModal from '../share/autoclose-modal';
import Window from '../share/windows';
import {todonimeURLMake} from '../../lib/url-maker';

import PNotify from 'pnotify/dist/es/PNotify';
import PNotifyButtons from 'pnotify/dist/es/PNotifyButtons';

export default class Share extends Component {
	onFocus(e) {
		e.currentTarget.select();
		document.execCommand('copy');

		PNotify.success({
	    text: "Ссылка скопирована в буфер обмена",
	    addClass: 'z-indx-top b-white',
	    width: '250px',
	    minHeight: '32px',
	    delay: 1500
	  });
	}

	makeWindow() {
		const {id, episode} = this.props;
		return (
			<Window style={{
				width: '250px',
				right: '35px'
			}}>
				<input
					type="text"
					onFocus={this.onFocus.bind(this)}
					value={todonimeURLMake(id, episode)}
					readonly="true"
					style={{width: '100%', boxSizing: 'border-box'}}
				/>
			</Window>
		);
	}

	render() {
		return (
			<AutoCloseModal
				button={<i
					className="material-icons show-anime-hover anime__manage play"
					title="Скопировать ссылку на серию"
				>
					share
				</i>}
			>
				{this.makeWindow()}
			</AutoCloseModal>
		);
	}
}
