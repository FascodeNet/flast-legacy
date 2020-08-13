import React, { Component } from 'react';

import { Suggest, SuggestListContainer, SuggestListItem, SuggestListItemIcon, SuggestListItemPrimaryText, SuggestListItemSecondaryText, SuggestButton } from './Suggest';

import DarkFileIcon from '../../Resources/dark/file.svg';
import LightFileIcon from '../../Resources/light/file.svg';
import DarkSearchIcon from '../../Resources/dark/search.svg';
import LightSearchIcon from '../../Resources/light/search.svg';

import * as http from 'http';
import * as https from 'https';
import { parse } from 'url';

import { isURL, prefixHttp } from '../../../Utils/URL';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const path = window.require('path');

const Config = window.require('electron-store');
const config = new Config();
const userConfig = new Config({
	cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = window.require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

class SuggestComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: '',
			suggestions: [],
			searchEngines: []
		};

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});
	}

	componentDidMount = async () => {
		userConfig.get('searchEngine.searchEngines').forEach((item, i) => {
			this.setState(state => { return { searchEngines: [...state.searchEngines, item] }; });
		});

		this.showSuggest(this.props.text);
	}

	componentDidUpdate = async (props) => {
		if (this.props.text !== props.text) {
			this.setState({ searchEngines: [] });
			userConfig.get('searchEngine.searchEngines').forEach((item, i) => {
				this.setState(state => { return { searchEngines: [...state.searchEngines, item] }; });
			});

			this.showSuggest(this.props.text);
		}
	}

	showSuggest = async (text) => {
		const data = JSON.parse((await this.requestURL(`http://google.com/complete/search?client=chrome&hl=ja&ie=utf_8&oe=utf_8&q=${encodeURIComponent(text)}`)).data);

		let suggestions = [];

		console.log(data);
		for (const item of data[1])
			if (suggestions.indexOf(item) === -1)
				suggestions.push(String(item).toLowerCase());

		this.setState({
			suggestions: suggestions.sort((a, b) => a.length - b.length).slice(0, 5),
		});

		console.log(suggestions.sort((a, b) => a.length - b.length).slice(0, 5));
	}

	requestURL = (url) =>
		new Promise((resolve, reject) => {
			const options = parse(url);

			let request = http.request;
			if (options.protocol === 'https:')
				request = https.request;

			const req = request(options, res => {
				let data = '';
				res.setEncoding('utf8');

				res.on('data', chunk => {
					data += chunk;
				});

				res.on('end', () => {
					const d = { ...res, data };
					resolve(d);
				});
			});

			req.on('error', e => {
				reject(e);
			});

			req.end();
		});

	getSearchEngine = () => {
		for (var i = 0; i < userConfig.get('searchEngine.searchEngines').length; i++)
			if (userConfig.get('searchEngine.searchEngines')[i].name === userConfig.get('searchEngine.defaultEngine'))
				return userConfig.get('searchEngine.searchEngines')[i];
		return userConfig.get('searchEngine.searchEngines')[0];
	}

	getSuggestIcon = () => {
		const value = this.props.text;

		if (isURL(value) && !value.includes('://'))
			return userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? DarkFileIcon : LightFileIcon;
		else if (!value.includes('://'))
			return userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? DarkSearchIcon : LightSearchIcon;
		else
			return userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? DarkFileIcon : LightFileIcon;
	}

	getSuggestSecondaryText = () => {
		const value = this.props.text;

		if (isURL(value) && !value.includes('://'))
			return lang.window.toolBar.addressBar.textBox.suggest.open;
		else if (!value.includes('://'))
			return String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, this.getSearchEngine().name);
		else
			return lang.window.toolBar.addressBar.textBox.suggest.open;
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

	render() {
		const webView = this.props.webView;

		return (
			<Suggest width={this.props.textBoxWidth} top={this.props.textBoxTop} left={this.props.textBoxLeft} isShowing={this.props.isShowing} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')}>
				<SuggestListContainer>
					<SuggestListItem style={{ borderBottom: this.state.suggestions.length > 0 ? 'solid 1px #c1c1c1' : 'none', color: userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? '#f9f9fa' : '#353535' }} windowId={this.props.windowId} onClick={() => { this.props.loadURL(this.props.text); }}>
						<SuggestListItemIcon src={this.getSuggestIcon()} size={17} />
						<SuggestListItemPrimaryText>{this.props.text}</SuggestListItemPrimaryText>
						<SuggestListItemSecondaryText>
							<span style={{ margin: '0px 4px' }}>&mdash;</span>
							{this.getSuggestSecondaryText()}
						</SuggestListItemSecondaryText>
					</SuggestListItem>
					{this.state.suggestions.map((item, i) => {
						return (
							<SuggestListItem tabIndex={i} key={i} style={{ color: userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? '#f9f9fa' : '#353535' }} windowId={this.props.windowId} onClick={() => { this.props.loadURL(this.getSearchEngine().url.replace('%s', encodeURIComponent(item))); }}>
								<SuggestListItemIcon src={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? DarkSearchIcon : LightSearchIcon} size={17} />
								<SuggestListItemPrimaryText>{item}</SuggestListItemPrimaryText>
								<SuggestListItemSecondaryText>
									<span style={{ margin: '0px 4px' }}>&mdash;</span>
									{String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, this.getSearchEngine().name)}
								</SuggestListItemSecondaryText>
							</SuggestListItem>
						);
					})}
				</SuggestListContainer>
				<ul style={{ margin: 0, padding: 0, backgroundColor: userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? '#5a5a5a' : '#eaeaea', borderTop: 'solid 1px #c1c1c1' }}>
					<SuggestButton style={{ listStyle: 'none', borderRight: 'solid 1px #c1c1c1', padding: '5px 15px', display: 'inline-table' }} title={this.getSearchEngine().name} onClick={() => { this.props.loadURL(this.getSearchEngine().url.replace('%s', encodeURIComponent(this.props.text))); }}>
						<img src={`https://www.google.com/s2/favicons?domain=${parse(this.getSearchEngine().url).protocol}//${parse(this.getSearchEngine().url).hostname}`} alt={this.getSearchEngine().name} style={{ verticalAlign: 'middle' }} />
						<span style={{ marginLeft: 8, verticalAlign: 'middle' }}>{String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, this.getSearchEngine().name)}</span>
					</SuggestButton>
					{this.state.searchEngines.map((item, i) => {
						if (this.getSearchEngine().url !== item.url) {
							const parsed = parse(item.url);
							return (
								<SuggestButton key={i} style={{ listStyle: 'none', borderRight: 'solid 1px #c1c1c1', padding: '5px 15px', display: 'inline-table' }} title={String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, item.name)} onClick={() => { this.props.loadURL(item.url.replace('%s', encodeURIComponent(this.props.text))); }}>
									<img src={`https://www.google.com/s2/favicons?domain=${parsed.protocol}//${parsed.hostname}`} alt={item.name} style={{ verticalAlign: 'middle' }} />
								</SuggestButton>
							);
						}
					})}

					<SuggestButton style={{ listStyle: 'none', float: 'right', padding: '5px 10px', display: 'inline-table' }} onClick={() => this.props.loadURL()}>
						<svg name="TitleBarClose" width="12" height="12" viewBox="0 0 12 12" fill={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? '#f9f9fa' : '#353535'} style={{ verticalAlign: 'middle' }}>
							<polygon fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
						</svg>
					</SuggestButton>
				</ul>
			</Suggest>
		);
	}
}

export default SuggestComponent;