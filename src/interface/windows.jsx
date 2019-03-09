import React, { Component } from "react";
import ReactDOM from 'react-dom';

export const Window = ({title, children, onClose, contentStyles, ...props}) => {
	return (
		<div className="window" {...props}>
			<WindowHeader title={title} onClose={onClose}/>
			<WindowContent style={contentStyles}>{children}</WindowContent>
		</div>
	);
}

const WindowHeader = ({title, onClose}) => {
	return (
		<div className="window__header">
			<div className="row">
				<span className="window__header-title">{title}</span>
				<span className="window__header-toolbox">
					<img src="/images/cancel.svg" onClick={onClose}/>
				</span>
			</div>
		</div>
	);
}

const WindowContent = ({children, ...props}) => {
	return (
		<div className="window__content" {...props}>{children}</div>
	);
}