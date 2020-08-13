import React, { Component } from 'react';
import styled from 'styled-components';
import { parse, format } from 'url';

import Button from './Components/Button';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const platform = require('electron-platform');
const path = window.require('path');

const Config = window.require('electron-store');
const config = new Config();
const userConfig = new Config({
	cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = window.require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

const Window = styled.div`
  width: auto;
  height: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'auto' : '100%'};
  margin: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '0px 4px' : '0px'};
  padding: 6px;
  display: flex;
  flex-direction: column;
  border-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'none' : (props => !props.isDarkModeOrPrivateMode ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  box-shadow: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '0px 2px 4px rgba(0, 0, 0, 0.16), 0px 2px 4px rgba(0, 0, 0, 0.23)' : 'none'};
  box-sizing: border-box;
`;

class AuthenticationWindow extends Component {
	
	constructor(props) {
		super(props);

		this.state = {
			windowId: '',
			userName: '',
			passWord: ''
		};

		ipcRenderer.on(`authWindow-${remote.getCurrentWindow().id}`, (e, args) => {
			this.setState({ windowId: args.windowId });
			this.forceUpdate();
		});

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});

		this.setState({ passWord: '' });
		document.title = '認証';
	}

	submit = () => {
		ipcRenderer.send(`authWindow-result-${remote.getCurrentWindow().id}`, { user: this.state.userName, pass: this.state.passWord });
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

	render() {
		return (
			<Window isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} onMouseEnter={(e) => { remote.getCurrentWindow().setIgnoreMouseEvents(false); }} onMouseLeave={(e) => { remote.getCurrentWindow().setIgnoreMouseEvents(true, { forward: true }); }}>
				<div style={{ marginBottom: 10 }}>
					<label style={{ whiteSpace: 'normal' }}>このサイトにログインするための認証情報を入力してください。</label>
					<label style={{ marginBottom: 0 }}>ユーザー名</label>
					<input type="text" value={this.state.userName} onChange={(e) => { this.setState({ userName: e.target.value }); }} style={{ width: '100%', cursor: 'initial', paddingLeft: 3, paddingRight: 3 }} />
					<label style={{ marginTop: 5, marginBottom: 0 }}>パスワード</label>
					<input type="password" value={this.state.passWord} onChange={(e) => { this.setState({ passWord: e.target.value }); }} style={{ width: '100%', cursor: 'initial', paddingLeft: 3, paddingRight: 3 }} />
				</div>
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<Button style={{ width: '49.2%' }} tabIndex={0} onClick={this.submit.bind(this)}>送信</Button>
					<Button style={{ width: '49.2%' }} tabIndex={0} onClick={() => ipcRenderer.send(`authWindow-close-${remote.getCurrentWindow().id}`, {})}>キャンセル</Button>
				</div>
			</Window>
		);
	}
}

export default AuthenticationWindow;