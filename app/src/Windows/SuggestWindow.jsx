import React, { Component, Fragment } from 'react';

import styled from 'styled-components';

import DarkFileIcon from './Resources/dark/file.svg';
import LightFileIcon from './Resources/light/file.svg';

import DarkSearchIcon from './Resources/dark/search.svg';
import LightSearchIcon from './Resources/light/search.svg';

import * as http from 'http';
import * as https from 'https';
import { parse } from 'url';

import { isURL } from '../Utils/URL';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const platform = window.require('electron-platform');
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
  padding: 0px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'none' : (props => !props.isDarkModeOrPrivateMode ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  box-shadow: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '0px 2px 4px rgba(0, 0, 0, 0.16), 0px 2px 4px rgba(0, 0, 0, 0.23)' : 'none'};
  box-sizing: border-box;
`;

const Button = styled.li`
  display: inline-block;
  box-sizing: border-box;
  background: transparent;
  list-style: none;
  transition: 0.2s background-color;
  font-family: 'Noto Sans', 'Noto Sans JP';

  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;

const SuggestListContainer = styled.ul`
  margin: 5px;
  padding: 0px;
  box-sizing: border-box;
`;

const SuggestListItem = styled.li`
  padding: ${`4px ${40 * (userConfig.get('design.isHomeButton') ? 5 : 4) - 40}`}px;
  border-radius: 2px;
  box-sizing: border-box;
  list-style: none;
  transition: 0.2s background-color;
  font-family: 'Noto Sans', 'Noto Sans JP';

  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;

const SuggestListItemSecondaryText = styled.span`
  margin-left: 5px;
  opacity: 0;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Noto Sans', 'Noto Sans JP';
  
  ${SuggestListItem}:hover & {
	opacity: 1;
  }
`;

const SuggestListItemIcon = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  margin-right: 5px;
  display: inline-block;
  vertical-align: sub;
  background-image: url(${props => props.src});
  background-size: ${props => props.size}px;
  background-position: center;
  background-repeat: no-repeat;
  box-sizing: border-box;
`;

const SearchEngineListContainer = styled.ul`
  margin: 0;
  padding: 0;
  overflow-x: auto;
  white-space: nowrap;

  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
  }

  ::-webkit-scrollbar-thumb {
    background: #ccc;
  }
`;

const SearchEngineListButton = styled(Button)`
	border-right: solid 1px #c1c1c1;
	padding: 5px 15px;
	height: 100%;
`;

class SuggestWindow extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: '',
			text: '',
			suggestions: [],
			searchEngines: []
		};

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on(`suggestWindow-${this.props.match.params.windowId}`, async (e, args) => {
			const data = JSON.parse((await this.requestURL(`http://google.com/complete/search?client=chrome&hl=ja&ie=utf_8&oe=utf_8&q=${encodeURIComponent(args.text)}`)).data);

			let suggestions = [];

			const text = data[0].toLowerCase();
			for (const item of data[1])
				if (suggestions.indexOf(item) === -1)
					suggestions.push({ value: String(item).toLowerCase(), texts: [text, String(item).replace(text, '').toLowerCase()] });

			this.setState({
				id: args.id,
				text: args.text,
				suggestions: suggestions.sort((a, b) => a.length - b.length).slice(0, 5)
			});
		});
	}

	componentDidMount = () => {
		userConfig.get('searchEngine.searchEngines').forEach((item, i) => {
			this.setState(state => { return { searchEngines: [...state.searchEngines, item] }; });
		});
	}

	requestURL = (url) =>
		new Promise((resolve, reject) => {
			const options = parse(url);

			let { request } = http;

			if (options.protocol === 'https:')
				request = https.request;

			const req = request(options, (res) => {
				let data = '';
				res.setEncoding('utf8');

				res.on('data', (chunk) => data += chunk);
				res.on('end', () => resolve({ ...res, data }));
			});

			req.on('error', (e) => reject(e));

			req.end();
		});

	getSearchEngine = () => {
		for (var i = 0; i < userConfig.get('searchEngine.searchEngines').length; i++)
			if (userConfig.get('searchEngine.searchEngines')[i].name == userConfig.get('searchEngine.defaultEngine'))
				return userConfig.get('searchEngine.searchEngines')[i];
		return userConfig.get('searchEngine.searchEngines')[0];
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

	loadURL = (value) => {
		ipcRenderer.send(`window-hideSuggest-${this.props.match.params.windowId}`, {});

		if (isURL(value) && !value.includes('://')) {
			ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: `http://${value}` });
		} else if (!value.includes('://')) {
			ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: this.getSearchEngine().url.replace('%s', encodeURIComponent(value)) });
		} else {
			const pattern = /^(file:\/\/\S.*)\S*$/;

			if (pattern.test(value)) {
				ipcRenderer.send(`browserView-loadFile-${this.props.match.params.windowId}`, { id: this.state.id, url: value.replace('file:///', '') });
			} else {
				ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: value });
			}
		}
	}

	getSuggestIcon = () => {
		const value = this.state.text;

		if (isURL(value) && !value.includes('://')) {
			return this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkFileIcon : LightFileIcon;
		} else if (!value.includes('://')) {
			return this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkSearchIcon : LightSearchIcon;
		} else {
			return this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkFileIcon : LightFileIcon;
		}
	}

	getSuggestSecondaryText = () => {
		const value = this.state.text;

		if (isURL(value) && !value.includes('://')) {
			return lang.window.toolBar.addressBar.textBox.suggest.open;
		} else if (!value.includes('://')) {
			return String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, this.getSearchEngine().name);
		} else {
			return lang.window.toolBar.addressBar.textBox.suggest.open;
		}
	}

	getFavicon = (url) => {
		const hostName = parse(url).hostname;
		return `https://www.google.com/s2/favicons?domain=${hostName.startsWith('www.') ? hostName.substring(4) : hostName}`;
	}

	render() {
		return (
			<Window isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} onMouseEnter={(e) => { remote.getCurrentWindow().setIgnoreMouseEvents(false); }} onMouseLeave={(e) => { remote.getCurrentWindow().setIgnoreMouseEvents(true, { forward: true }); }}>
				<SuggestListContainer>
					<SuggestListItem style={{ borderBottom: this.state.suggestions.length > 0 ? 'solid 1px #c1c1c1' : 'none', padding: 4, color: this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#f9f9fa' : '#353535' }} windowId={this.props.match.params.windowId} onClick={() => { this.loadURL(this.state.text); }}>
						<SuggestListItemIcon src={this.getSuggestIcon()} size={16} />
						{this.state.text}
						<SuggestListItemSecondaryText>
							<span style={{ margin: '0px 4px' }}>&mdash;</span>
							{this.getSuggestSecondaryText()}
						</SuggestListItemSecondaryText>
					</SuggestListItem>
					{this.state.suggestions.map((item, i) => {
						return (
							<SuggestListItem key={i} style={{ padding: 4, color: this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#f9f9fa' : '#353535' }} windowId={this.props.match.params.windowId} onClick={() => { ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: this.getSearchEngine().url.replace('%s', encodeURIComponent(item.value)) }); }}>
								<SuggestListItemIcon src={this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkSearchIcon : LightSearchIcon} size={16} />
								{item.value.startsWith(item.texts[0]) ? <Fragment>{item.texts[0]}<b>{item.texts[1]}</b></Fragment> : item.value}
								<SuggestListItemSecondaryText>
									<span style={{ margin: '0px 4px' }}>&mdash;</span>
									{String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, this.getSearchEngine().name)}
								</SuggestListItemSecondaryText>
							</SuggestListItem>
						);
					})}
				</SuggestListContainer>
				<ul style={{ display: 'flex', margin: 0, padding: 0, backgroundColor: this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#5a5a5a' : '#eaeaea', borderTop: 'solid 1px #c1c1c1', borderBottomLeftRadius: platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0, borderBottomRightRadius: platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0 }}>
					<Button style={{ borderRight: 'solid 1px #c1c1c1', padding: '5px 10px', whiteSpace: 'nowrap' }} title={this.getSearchEngine().name} onClick={() => { ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: this.getSearchEngine().url.replace('%s', encodeURIComponent(this.state.text)) }); }}>
						<img src={this.getFavicon(this.getSearchEngine().url)} alt={this.getSearchEngine().name} style={{ verticalAlign: 'middle' }} />
						<span style={{ marginLeft: 8, verticalAlign: 'middle' }}>{String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, this.getSearchEngine().name)}</span>
					</Button>
					<SearchEngineListContainer>
						{this.state.searchEngines.map((item, i) => {
							if (this.getSearchEngine().url !== item.url) {
								const parsed = parse(item.url);
								return (
									<SearchEngineListButton key={i} title={String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, item.name)} onClick={() => { ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: item.url.replace('%s', encodeURIComponent(this.state.text)) }); }}>
										<img src={this.getFavicon(item.url)} alt={item.name} style={{ verticalAlign: 'middle' }} />
									</SearchEngineListButton>
								);
							}
						})}
					</SearchEngineListContainer>
					<Button style={{ marginLeft: 'auto', borderLeft: 'solid 1px #c1c1c1', padding: '5px 10px' }} onClick={() => ipcRenderer.send(`suggestWindow-close-${this.props.match.params.windowId}`, {})}>
						<svg name="TitleBarClose" width="12" height="12" viewBox="0 0 12 12" fill={this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#f9f9fa' : '#353535'} style={{ verticalAlign: 'middle' }}>
							<polygon fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
						</svg>
					</Button>
				</ul>
			</Window>
		);
	}
}

export default SuggestWindow;