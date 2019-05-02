import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Tabs, {MailTab, PlannedTab, WatchingTab, BookmarksTab} from "./components/tabs.jsx";

export const App = (props) =>
	<div className="app__container">
		<Tabs activeTab="2">
			<MailTab name="Почта"/>
			<PlannedTab name="Запланированные"/>
			<WatchingTab name="Смотрю"/>
			<BookmarksTab name="Календарь"/>
		</Tabs>
	</div>