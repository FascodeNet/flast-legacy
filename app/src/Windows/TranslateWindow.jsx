import React, { Component } from 'react';
import styled from 'styled-components';
import { parse, format } from 'url';

import DarkBackIcon from './Resources/dark/arrow_back.svg';
import LightBackIcon from './Resources/light/arrow_back.svg';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const platform = window.require('electron-platform');
const path = window.require('path');

const pkg = window.require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const Config = window.require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = window.require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

const buttonHeight = 27;

const Window = styled.div`
  width: auto;
  height: 100%;
  margin: 0px;
  padding: 0px;
  display: flex;
  flex-direction: column;
  border: solid 1px ${props => !props.isDarkModeOrPrivateMode ? '#e1e1e1' : '#8b8b8b'};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  box-sizing: border-box;
`;

class MoreIcon extends Component {
	render() {
		return (
			<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 59.414 59.414">
				<g>
					<polygon fill={this.props.isDarkModeOrPrivateMode ? '#e1e1e1' : '#8b8b8b'} points="15.561,59.414 14.146,58 42.439,29.707 14.146,1.414 15.561,0 45.268,29.707"></polygon>
				</g>
			</svg>
		);
	}
}

class TranslateWindow extends Component {
	constructor(props) {
		super(props);
		this.state = {
			url: ''
		};

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});
	}

	componentDidMount = () => {
		let webView = this.refs.webView;

		webView.addEventListener('dom-ready', () => {
			webView.executeJavaScript(`
				document.getElementById('wtgbr').parentNode.removeChild(document.getElementById('wtgbr'));
				document.getElementById('gt-appname').parentNode.removeChild(document.getElementById('gt-appname'));
				document.getElementById('contentframe').style.top = '42px';
				document.getElementById('gt-appbar').style.padding = '6px';
				document.getElementById('gt-sl').style.width = '90px';
				document.getElementById('gt-tl').style.width = '90px';
			`);
		});

		ipcRenderer.on(`translateWindow-${this.props.match.params.windowId}`, (e, args) => {
			this.setState({ url: args.url });
			this.forceUpdate();

			webView.loadURL(`https://translate.google.com/translate?hl=&sl=auto&tl=ja&u=${args.url}`);
			webView.executeJavaScript(`
				document.getElementById('wtgbr').parentNode.removeChild(document.getElementById('wtgbr'));
				document.getElementById('gt-appname').parentNode.removeChild(document.getElementById('gt-appname'));
				document.getElementById('contentframe').style.top = '42px';
				document.getElementById('gt-appbar').style.padding = '6px';
				document.getElementById('gt-sl').style.width = '90px';
				document.getElementById('gt-tl').style.width = '90px';
			`);
		});
	}

	getTheme = () => {
		const userTheme = String(userConfig.get('design.theme')).toLowerCase();
		const baseTheme = String(window.require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme.base).toLowerCase();

		if (userTheme === 'system' || baseTheme === 'system')
			return nativeTheme.shouldUseDarkColors;
		else if (userTheme === 'light' || baseTheme === 'light')
			return false;
		else if (userTheme === 'dark' || baseTheme === 'dark')
			return true;
	}

	getForegroundColor = (hexColor) => {
		var r = parseInt(hexColor.substr(1, 2), 16);
		var g = parseInt(hexColor.substr(3, 2), 16);
		var b = parseInt(hexColor.substr(5, 2), 16);

		return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? '#ffffff' : '#000000';
	}

	addTab = (url = (userConfig.get('homePage.isDefaultHomePage') ? `${protocolStr}://home/` : userConfig.get('homePage.defaultPage')), isInternal = false) => {
		if (isInternal) {
			const u = parse(this.state.url);
			console.log(u.protocol);

			if (u.protocol === `${protocolStr}:`) {
				ipcRenderer.send(`browserView-loadURL-${this.props.match.params.windowId}`, { id: this.props.match.params.tabId, url });
			} else {
				ipcRenderer.send(`tab-add-${this.props.match.params.windowId}`, { url, isActive: true });
			}
		} else {
			ipcRenderer.send(`tab-add-${this.props.match.params.windowId}`, { url, isActive: true });
		}
	}

	closeMenu = () => {
		ipcRenderer.send(`translateWindow-close-${this.props.match.params.windowId}`, {});
	}

	getIconDirectory = () => {
		return `${app.getAppPath()}/static/${this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? 'dark' : 'light'}`;
	}

	render() {
		return (
			<div style={{ boxSizing: 'border-box', width: '100%', height: '100%' }}>
				<Window isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')}>
					<webview partition="persist:extensions-translate" style={{ height: '100%' }} ref="webView" src={`https://translate.google.com/translate?hl=&sl=auto&tl=ja&u=${this.state.url}`} />
				</Window>
			</div>
		);
	}
}

export default TranslateWindow;