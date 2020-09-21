import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import MainWindow from './Windows/MainWindow';
import InformationWindow from './Windows/InformationWindow';
import PermissionWindow from './Windows/PermissionWindow';
import MenuWindow from './Windows/MenuWindow';

import SuggestWindow from './Windows/SuggestWindow';
import AuthenticationWindow from './Windows/AuthenticationWindow';

import TranslateWindow from './Windows/TranslateWindow';

import ApplicationWindow from './Windows/ApplicationWindow';

class App extends Component {
	render() {
		return (
			<HashRouter>
				<Route exact path='/window/:windowId/:urls?' component={MainWindow} />
				<Route path='/info' component={InformationWindow} />
				<Route path='/permission/:windowId' component={PermissionWindow} />
				<Route path='/menu' component={MenuWindow} />

				<Route path='/suggest/:windowId' component={SuggestWindow} />
				<Route path='/authentication' component={AuthenticationWindow} />
				
				<Route path='/extensions/translate/:windowId' component={TranslateWindow} />

				<Route path='/app/:windowId/:url' component={ApplicationWindow} />
			</HashRouter>
		);
	}
}

export default App;