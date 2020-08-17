import React, { Component, Fragment } from 'react';
import { findDOMNode } from 'react-dom';
import { WindowsControl } from 'react-windows-controls';
import Tippy from '@tippyjs/react';
import Sortable from 'sortablejs';
import { parse, format } from 'url';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Window from './Components/Window';
import WindowButtons from './Components/WindowButtons';
import WindowButton from './Components/WindowButton';
import WindowContent from './Components/WindowContent';
import { Titlebar } from './Components/Titlebar';
import { TabsContainer, TabContainer, Tab, TabIcon, TabTitle, TabStatusIcon, TabCloseButton } from './Components/Tab';
import TabButton from './Components/TabButton';
import TabContent from './Components/TabContent';
import Toolbar from './Components/Toolbar';
import { ToolbarButton, ToolbarButtonBadge } from './Components/ToolbarButton';
import ToolbarDivider from './Components/ToolbarDivider';
import { ToolbarTextBoxWrapper, ToolbarTextBox, ToolbarDummyTextBox } from './Components/ToolbarTextBox';
import { BookmarkBar, BookmarkBarButton } from './Components/BookmarkBar';
import ContentWrapper from './Components/ContentWrapper';

import ApplicationIcon from './Resources/icon.png';

import DarkBackIcon from './Resources/dark/arrow_back.svg';
import LightBackIcon from './Resources/light/arrow_back.svg';
import DarkForwardIcon from './Resources/dark/arrow_forward.svg';
import LightForwardIcon from './Resources/light/arrow_forward.svg';
import BackInActiveIcon from './Resources/inactive/arrow_back.svg';
import ForwardInActiveIcon from './Resources/inactive/arrow_forward.svg';
import DarkReloadIcon from './Resources/dark/reload.svg';
import LightReloadIcon from './Resources/light/reload.svg';
import DarkHomeIcon from './Resources/dark/home.svg';
import LightHomeIcon from './Resources/light/home.svg';
import DarkInformationIcon from './Resources/dark/information.svg';
import LightInformationIcon from './Resources/light/information.svg';
import DarkSecureIcon from './Resources/dark/secure.svg';
import LightSecureIcon from './Resources/light/secure.svg';
import DarkInSecureIcon from './Resources/dark/insecure.svg';
import LightInSecureIcon from './Resources/light/insecure.svg';
import DarkTranslateIcon from './Resources/dark/translate.svg';
import LightTranslateIcon from './Resources/light/translate.svg';
import DarkZoomInIcon from './Resources/dark/zoom_in.svg';
import LightZoomInIcon from './Resources/light/zoom_in.svg';
import DarkZoomOutIcon from './Resources/dark/zoom_out.svg';
import LightZoomOutIcon from './Resources/light/zoom_out.svg';
import DarkStarIcon from './Resources/dark/star.svg';
import LightStarIcon from './Resources/light/star.svg';
import DarkStarFilledIcon from './Resources/dark/star-filled.svg';
import LightStarFilledIcon from './Resources/light/star-filled.svg';
import DarkFeedbackIcon from './Resources/dark/feedback.svg';
import LightFeedbackIcon from './Resources/light/feedback.svg';
import DarkAccountIcon from './Resources/dark/account.svg';
import LightAccountIcon from './Resources/light/account.svg';
import DarkShieldIcon from './Resources/dark/shield.svg';
import LightShieldIcon from './Resources/light/shield.svg';
import DarkMoreIcon from './Resources/dark/more.svg';
import LightMoreIcon from './Resources/light/more.svg';
import DarkPublicIcon from './Resources/dark/public.svg';
import LightPublicIcon from './Resources/light/public.svg';
import DarkAddIcon from './Resources/dark/add.svg';
import LightAddIcon from './Resources/light/add.svg';
import DarkCloseIcon from './Resources/dark/close.svg';
import LightCloseIcon from './Resources/light/close.svg';
import DarkAudioIcon from './Resources/dark/audio.svg';
import LightAudioIcon from './Resources/light/audio.svg';
import DarkAudioMuteIcon from './Resources/dark/audio_mute.svg';
import LightAudioMuteIcon from './Resources/light/audio_mute.svg';
import DarkSearchIcon from './Resources/dark/search.svg';
import LightSearchIcon from './Resources/light/search.svg';

import DarkBookmarksIcon from './Resources/dark/bookmarks.svg';
import LightBookmarksIcon from './Resources/light/bookmarks.svg';
import DarkHistoryIcon from './Resources/dark/history.svg';
import LightHistoryIcon from './Resources/light/history.svg';
import DarkDownloadsIcon from './Resources/dark/downloads.svg';
import LightDownloadsIcon from './Resources/light/downloads.svg';
import DarkSettingsIcon from './Resources/dark/settings.svg';
import LightSettingsIcon from './Resources/light/settings.svg';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/themes/light-border.css';
import 'tippy.js/themes/material.css';
import 'tippy.js/themes/translucent.css';

import './Resources/fonts/SourceHanCodeJP-Normal.otf';

import { isURL } from '../Utils/URL';
import { createRef } from 'react';

const { remote, ipcRenderer } = window.require('electron');
const { app, systemPreferences, Menu, dialog, nativeTheme } = remote;

const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const platform = window.require('electron-platform');
const path = window.require('path');

const Config = window.require('electron-store');
const config = new Config();
const userConfig = new Config({
	cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = window.require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

const getOrDefault = (value, defaultValue) => {
	return value !== undefined && value !== null && value != 'auto' ? value : defaultValue;
}

class BookmarkBarComponent extends Component {

	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<Fragment>
				{this.props.bookmarks
					.filter((item, i) => item.parentId == undefined || item.parentId == null || item.parentId == '')
					.sort((a, b) => a.isFolder < b.isFolder ? 1 : -1)
					.map((item, v) => (
						<BookmarkBarButton key={v} isDarkModeOrPrivateMode={this.props.isDarkModeOrPrivateMode} isEnabled={true} size={16} onClick={() => { }}
							title={item.title} src={!item.isFolder ? (String(item.url).startsWith(`${protocolStr}://`) || String(item.url).startsWith(`${fileProtocolStr}://`) ? `${protocolStr}://resources/icons/public.svg` : (item.favicon ? item.favicon : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`)) : `${protocolStr}://resources/icons/folder_close.png`} />
					))
				}
			</Fragment>
		);
	}
}

class BrowserView extends Component {

	constructor(props) {
		super(props);

		this.blockCount = 0;

		this.state = {
			barText: '',
			findText: '',
			previousText: '',
			resultString: '',
			activeMatch: 0,
			certificate: {},
			viewUrl: '',
			defaultZoomLevel: userConfig.get('pageSettings.contents.zoomLevel', 1),
			zoomLevel: 1,
			isLoading: false,
			canGoBack: false,
			canGoForward: false,
			isBookmarked: false,
			isShowing: false,
			bookMarks: []
		};

		this.textBoxRef = createRef();
	}

	componentDidMount() {
		this.setState({
			defaultZoomLevel: userConfig.get('pageSettings.contents.zoomLevel', 1),
			zoomLevel: userConfig.get('pageSettings.contents.zoomLevel', 1)
		});

		ipcRenderer.on(`window-bookmarks-get`, (e, args) => {
			this.setState({ bookMarks: args.bookmarks });
		});

		ipcRenderer.on(`browserView-start-loading-${this.props.windowId}`, (e, args) => {
			if (args.id !== this.props.index) return
			this.setState({ isLoading: true });
			this.blockCount = 0;
		});

		ipcRenderer.on(`browserView-stop-loading-${this.props.windowId}`, (e, args) => {
			if (args.id !== this.props.index) return
			this.setState({ isLoading: false });
		});

		ipcRenderer.on(`browserView-load-${this.props.windowId}`, (e, args) => {
			if (args.id !== this.props.index) return
			this.props.updateTab();
			this.setState({ viewUrl: args.url, isBookmarked: args.isBookmarked });
			this.forceUpdate();
			if (!this.state.isShowing)
				this.setText(args.url);
		});

		ipcRenderer.on(`browserView-certificate-${this.props.windowId}`, (e, args) => {
			if (args.id !== this.props.index) return
			this.setState({ certificate: args.certificate });
		});

		ipcRenderer.on(`blocked-ad-${this.props.windowId}`, (e, args) => {
			if (args.id !== this.props.index) return
			this.blockCount++
		});

		ipcRenderer.on(`update-navigation-state-${this.props.windowId}`, (e, args) => {
			if (args.id !== this.props.index) return
			this.setState({ canGoBack: args.canGoBack, canGoForward: args.canGoForward });
		});

		ipcRenderer.on(`browserView-permission-${this.props.windowId}`, (e, args) => {
			if (args.id === this.props.index) {
				const toolTip = findDOMNode(this.infomationTooltip)._tippy;
				toolTip.setContent(args.content);
				toolTip.show();
				setTimeout(() => {
					toolTip.hide();
				}, 1250);
			}
		});

		ipcRenderer.on(`browserView-zoom-${this.props.windowId}`, (e, args) => {
			this.setState({ zoomLevel: args.result });
		});

		ipcRenderer.on(`notification-${this.props.windowId}`, (e, args) => {
			if (args.id === this.props.index) {
				const toolTip = findDOMNode(this.infomationTooltip)._tippy;
				toolTip.setContent(args.content);
				toolTip.show();
				setTimeout(() => {
					toolTip.hide();
				}, 1250);
			}
		});
	}

	componentToHex = (c) => {
		const hex = c.toString(16);
		return hex.length == 1 ? `0${hex}` : hex;
	}

	rgbToHex = (r, g, b) => {
		return `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;
	}

	toRGB = (hex) => {
		let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, (m, r, g, b) => `${r}${r}${g}${g}${b}${b}`);

		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			const value = this.state.barText;

			if (value.length > 0 || value !== '') {
				ipcRenderer.send(`window-hideSuggest-${this.props.windowId}`, {});
				this.setState({ isShowing: false });

				if (isURL(value) && !value.includes('://')) {
					ipcRenderer.send(`browserView-loadURL-${this.props.windowId}`, { id: this.props.index, url: `http://${value}` });
				} else if (!value.includes('://')) {
					ipcRenderer.send(`browserView-loadURL-${this.props.windowId}`, { id: this.props.index, url: this.getSearchEngine().url.replace('%s', encodeURIComponent(value)) });
				} else {
					ipcRenderer.send(`browserView-loadURL-${this.props.windowId}`, { id: this.props.index, url: value });
				}
			} else {
				ipcRenderer.send(`window-hideSuggest-${this.props.windowId}`, {});

				this.setText(this.state.viewUrl);
				this.setState({ isShowing: false });
			}
		} else if (e.key === 'Escape') {
			ipcRenderer.send(`window-hideSuggest-${this.props.windowId}`, {});

			this.setText(this.state.viewUrl);
			this.setState({ isShowing: false });
		} else if (e.key === 'Backspace') {
			if ((this.state.barText.length - 1) > 0) return;

			ipcRenderer.send(`window-hideSuggest-${this.props.windowId}`, {});
		}
	}

	handleContextMenu = (e) => {
		const menu = Menu.buildFromTemplate([
			...(app.isEmojiPanelSupported() ? [
				{
					label: lang.window.view.contextMenu.editable.emotePalette,
					icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/emote.png` : null,
					click: () => { app.showEmojiPanel(); }
				},
				{ type: 'separator' }
			] : []),
			{
				label: lang.window.view.contextMenu.editable.undo,
				icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/undo.png` : null,
				accelerator: 'CmdOrCtrl+Z',
				role: 'undo'
			},
			{
				label: lang.window.view.contextMenu.editable.redo,
				icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/redo.png` : null,
				accelerator: 'CmdOrCtrl+Y',
				role: 'redo'
			},
			{ type: 'separator' },
			{
				label: lang.window.view.contextMenu.editable.cut,
				icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/cut.png` : null,
				accelerator: 'CmdOrCtrl+X',
				role: 'cut'
			},
			{
				label: lang.window.view.contextMenu.editable.copy,
				icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/copy.png` : null,
				accelerator: 'CmdOrCtrl+C',
				role: 'copy'
			},
			{
				label: lang.window.view.contextMenu.editable.paste,
				icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/paste.png` : null,
				accelerator: 'CmdOrCtrl+V',
				role: 'paste'
			},
			{ type: 'separator' },
			{
				label: lang.window.view.contextMenu.editable.selectAll,
				accelerator: 'CmdOrCtrl+A',
				role: 'selectAll'
			}
		]);
		menu.popup();
	}

	getSearchEngine = () => {
		for (var i = 0; i < userConfig.get('searchEngine.searchEngines').length; i++)
			if (userConfig.get('searchEngine.searchEngines')[i].name === userConfig.get('searchEngine.defaultEngine'))
				return userConfig.get('searchEngine.searchEngines')[i];
		return userConfig.get('searchEngine.searchEngines')[0];
	}

	setText = (text) => {
		this.setState({ barText: text });
	}

	goBack = () => {
		ipcRenderer.send(`browserView-goBack-${this.props.windowId}`, { id: this.props.index });
	}

	goForward = () => {
		ipcRenderer.send(`browserView-goForward-${this.props.windowId}`, { id: this.props.index });
	}

	reload = () => {
		if (!this.state.isLoading) {
			ipcRenderer.send(`browserView-reload-${this.props.windowId}`, { id: this.props.index });
		} else {
			ipcRenderer.send(`browserView-stop-${this.props.windowId}`, { id: this.props.index });
		}
	}

	goHome = () => {
		ipcRenderer.send(`browserView-goHome-${this.props.windowId}`, { id: this.props.index });
	}

	certificate = () => {
		let title = '';
		let description = '';

		if (this.state.certificate.type === 'Internal') {
			title = lang.window.toolBar.addressBar.info.clicked.internal;
		} else if (this.state.certificate.type === 'Source') {
			title = lang.window.toolBar.addressBar.info.clicked.viewSource;
		} else if (this.state.certificate.type === 'File') {
			title = lang.window.toolBar.addressBar.info.clicked.file;
		} else if (this.state.certificate.type === 'Secure') {
			title = `<span style="color: ${this.getTheme() ? '#81c995' : '#188038'};">${lang.window.toolBar.addressBar.info.clicked.secure.title}</span>`;
			description = `${lang.window.toolBar.addressBar.info.clicked.secure.description}${this.state.certificate.title != undefined && this.state.certificate.title != null ? `<hr />${this.state.certificate.title} [${this.state.certificate.country}]` : ''}`;
		} else if (this.state.certificate.type === 'InSecure') {
			title = `<span style="color: ${this.getTheme() ? '#f28b82' : '#c5221f'};">${lang.window.toolBar.addressBar.info.clicked.insecure.title}</span>`;
			description = lang.window.toolBar.addressBar.info.clicked.insecure.description;
		}

		ipcRenderer.send(`window-infoWindow-${this.props.windowId}`, { title: '', description: '', url: this.state.viewUrl, certificate: this.state.certificate, isButton: false });
	}

	bookMark = () => {
		const toolTip = findDOMNode(this.markTooltip)._tippy;
		toolTip.show();
		setTimeout(() => {
			toolTip.hide();
		}, 1250);
		if (this.state.isBookmarked)
			ipcRenderer.send(`data-bookmark-remove-${this.props.windowId}`, { id: this.props.index, isPrivate: this.props.windowId.startsWith('private') });
		else
			ipcRenderer.send(`data-bookmark-add-${this.props.windowId}`, { id: this.props.index, isFolder: false, isPrivate: this.props.windowId.startsWith('private') });
	}

	openMenu = (openUserInfo = false) => {
		ipcRenderer.send(`window-menuWindow-${this.props.windowId}`, { id: this.props.index, url: this.state.viewUrl, openUserInfo });
	}

	getTheme = () => {
		if (!String(this.props.windowId).startsWith('private')) {
			const userTheme = String(userConfig.get('design.theme')).toLowerCase();
			const baseTheme = String(window.require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme.base).toLowerCase();

			if (userTheme === 'system' || baseTheme === 'system')
				return nativeTheme.shouldUseDarkColors;
			else if (userTheme === 'light' || baseTheme === 'light')
				return false;
			else if (userTheme === 'dark' || baseTheme === 'dark')
				return true;
		} else {
			return true;
		}
	}

	isDarkModeOrPrivateMode = (lightMode, darkMode) => {
		return !this.getTheme() ? lightMode : darkMode;
	}

	getCertificateIcon = () => {
		if (this.state.certificate !== undefined && this.state.certificate !== null) {
			if (this.state.certificate.type === 'Secure') {
				return this.isDarkModeOrPrivateMode.bind(this, LightSecureIcon, DarkSecureIcon);
			} else if (this.state.certificate.type === 'InSecure') {
				return this.isDarkModeOrPrivateMode.bind(this, LightInSecureIcon, DarkInSecureIcon);
			} else if (this.state.certificate.type === 'Internal') {
				return this.isDarkModeOrPrivateMode.bind(this, ApplicationIcon, ApplicationIcon);
			} else if (this.state.certificate.type === 'Search') {
				return this.isDarkModeOrPrivateMode.bind(this, LightSearchIcon, DarkSearchIcon);
			} else {
				return this.isDarkModeOrPrivateMode.bind(this, LightInformationIcon, DarkInformationIcon);
			}
		} else {
			return this.isDarkModeOrPrivateMode.bind(this, LightInformationIcon, DarkInformationIcon);
		}
	}

	getButtonCount = () => {
		let i = 1;

		if (this.state.zoomLevel != this.state.defaultZoomLevel)
			i += 1;
		if (!this.state.barText.startsWith(protocolStr))
			i += 2;

		return i;
	}

	render() {
		const themeConfig = window.require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme;
		const isBookmarkBar = userConfig.get('design.isBookmarkBar') === 1 || userConfig.get('design.isBookmarkBar') === 0 && this.state.viewUrl.startsWith(`${protocolStr}://home/`);

		return (
			<ContentWrapper>
				<Toolbar backgroundColor={getOrDefault(themeConfig.toolBar.background, !this.getTheme() ? '#f9f9fa' : '#353535')} borderColor={getOrDefault(themeConfig.toolBar.border, !this.getTheme() ? '#0000001f' : '#ffffff14')} isBookmarkBar={isBookmarkBar}>
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={this.state.canGoBack ? this.isDarkModeOrPrivateMode.bind(this, LightBackIcon, DarkBackIcon) : BackInActiveIcon} size={24}
						isShowing={true} isRight={false} isMarginLeft={true} isEnabled={this.state.canGoBack} title={lang.window.toolBar.back} onClick={() => { this.goBack(); }} />
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={this.state.canGoForward ? this.isDarkModeOrPrivateMode.bind(this, LightForwardIcon, DarkForwardIcon) : ForwardInActiveIcon} size={24}
						isShowing={true} isRight={false} isMarginLeft={false} isEnabled={this.state.canGoForward} title={lang.window.toolBar.forward} onClick={() => { this.goForward(); }} />
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={!this.state.isLoading ? this.isDarkModeOrPrivateMode.bind(this, LightReloadIcon, DarkReloadIcon) : this.isDarkModeOrPrivateMode.bind(this, LightCloseIcon, DarkCloseIcon)} size={24}
						isShowing={true} isRight={false} isMarginLeft={false} isEnabled={true} title={!this.state.isLoading ? lang.window.toolBar.reload.reload : lang.window.toolBar.reload.stop} onClick={() => { this.reload(); }} />
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={this.isDarkModeOrPrivateMode.bind(this, LightHomeIcon, DarkHomeIcon)} size={24}
						isShowing={userConfig.get('design.isHomeButton')} isRight={false} isMarginLeft={false} isEnabled={true} title={lang.window.toolBar.home} onClick={() => { this.goHome(); }} />
					<ToolbarTextBoxWrapper isDarkModeOrPrivateMode={this.getTheme()}>
						<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={this.getCertificateIcon()} size={18}
							isShowing={true} isRight={false} isMarginLeft={true} isEnabled={this.state.certificate.type !== 'Search'} title={lang.window.toolBar.addressBar.info.name} onClick={() => { this.state.certificate.type !== 'Search' && this.certificate(); }} />

						<ToolbarDummyTextBox isShowing={!this.state.isShowing} buttonCount={this.getButtonCount}
							onMouseDown={(e) => { if (e.button === 1) return; this.setState({ isShowing: true }); this.textBoxRef.current.select(); this.textBoxRef.current.focus(); }}>
							{(() => {
								const value = decodeURIComponent(this.state.barText);
								try {
									const url = new URL(isURL(value) && !value.includes('://') ? `http://${value}` : value);

									if (!this.state.isShowing) {
										switch (this.state.certificate.type) {
											case 'Secure': return (
												<Fragment>
													<span style={{ color: `#${this.getTheme() ? '81c995' : '188038'}` }}>{`${url.protocol}//`}</span>
													{url.hostname}
													<span style={{ color: `#${this.getTheme() ? '909192' : '696a6c'}`, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{decodeURIComponent(`${url.port !== '' ? `:${url.port}` : ''}${url.pathname}${url.search}${url.hash}`)}</span>
												</Fragment>
											);
											case 'InSecure': return (
												<Fragment>
													<span style={{ color: `#${this.getTheme() ? 'f28b82' : 'c5221f'}` }}>{`${url.protocol}//`}</span>
													{url.hostname}
													<span style={{ color: `#${this.getTheme() ? '909192' : '696a6c'}`, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{decodeURIComponent(`${url.port !== '' ? `:${url.port}` : ''}${url.pathname}${url.search}${url.hash}`)}</span>
												</Fragment>
											);
											case 'Search': return (!this.state.viewUrl.startsWith(`${protocolStr}://home`) ? <Fragment>{value}</Fragment> : null);
											case 'Internal': return (
												<Fragment>
													<span style={{ color: `#${this.getTheme() ? '909192' : '696a6c'}` }}>{`${url.protocol}//`}</span>
													{url.hostname}
													<span style={{ color: `#${this.getTheme() ? '909192' : '696a6c'}`, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{decodeURIComponent(`${url.port !== '' ? `:${url.port}` : ''}${url.pathname}${url.search}${url.hash}`)}</span>
												</Fragment>
											);
											case 'File': return (
												<Fragment>
													<span style={{ color: `#${this.getTheme() ? '909192' : '696a6c'}` }}>{`${url.protocol}//`}</span>
													{decodeURIComponent(`${url.port !== '' ? `:${url.port}` : ''}${url.pathname}${url.search}${url.hash}`)}
												</Fragment>
											);
											default: return (value);
										}
									} else {
										return (value);
									}
								} catch (e) {
									return (value);
								}
							})()}
						</ToolbarDummyTextBox>
						<ToolbarTextBox ref={this.textBoxRef} isShowing={this.state.isShowing} buttonCount={this.getButtonCount} value={this.state.certificate.type !== 'Search' && !this.state.barText.startsWith(`${protocolStr}://home`) ? decodeURIComponent(this.state.barText) : null} onKeyDown={this.handleKeyDown} onContextMenu={this.handleContextMenu}
							onChange={(e) => { this.setState({ barText: e.target.value }); ipcRenderer.send(`window-showSuggest-${this.props.windowId}`, { id: this.props.index, text: e.target.value }); e.currentTarget.focus(); }} onFocus={(e) => { this.setState({ isShowing: true }); e.target.select(); }} onBlur={(e) => this.setState({ isShowing: false })} />

						<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={this.isDarkModeOrPrivateMode.bind(this, LightTranslateIcon, DarkTranslateIcon)} size={18} style={{ right: this.state.zoomLevel != this.state.defaultZoomLevel ? 60 : 30, borderRadius: 0 }}
							isShowing={!this.state.barText.startsWith(protocolStr)} isRight={true} isMarginLeft={true} isEnabled={true} title={lang.window.toolBar.addressBar.translate} onClick={() => { ipcRenderer.send(`window-translateWindow-${this.props.windowId}`, { url: this.state.viewUrl }); }} />

						<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={this.state.zoomLevel > this.state.defaultZoomLevel ? this.isDarkModeOrPrivateMode.bind(this, LightZoomInIcon, DarkZoomInIcon) : this.isDarkModeOrPrivateMode.bind(this, LightZoomOutIcon, DarkZoomOutIcon)}
							size={18} style={{ right: !this.state.barText.startsWith(protocolStr) ? 30 : 0, borderRadius: 0 }} isShowing={this.state.zoomLevel != this.state.defaultZoomLevel} isRight={true} isMarginLeft={true} isEnabled={true} title={lang.window.toolBar.addressBar.zoomDefault} onClick={() => { ipcRenderer.send(`browserView-zoomDefault-${this.props.windowId}`, { id: this.props.index }); }} />

						<Tippy ref={ref => { this.markTooltip = ref; }} content={this.state.isBookmarked ? (this.props.windowId.startsWith('private') ? lang.window.toolBar.addressBar.bookmark.clicked.removePrivate : lang.window.toolBar.addressBar.bookmark.clicked.remove) : (this.props.windowId.startsWith('private') ? lang.window.toolBar.addressBar.bookmark.clicked.addPrivate : lang.window.toolBar.addressBar.bookmark.clicked.add)} theme={this.getTheme() ? 'dark' : 'light'} placement="left" arrow={true} trigger="manual">
							<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={this.state.isBookmarked ? this.isDarkModeOrPrivateMode.bind(this, LightStarFilledIcon, DarkStarFilledIcon) : this.isDarkModeOrPrivateMode.bind(this, LightStarIcon, DarkStarIcon)} size={18}
								isShowing={!this.state.barText.startsWith(protocolStr)} isRight={true} isMarginLeft={true} isEnabled={true} title={this.state.isBookmarked ? lang.window.toolBar.addressBar.bookmark.remove : lang.window.toolBar.addressBar.bookmark.add} onClick={() => { this.bookMark(); }} />
						</Tippy>
					</ToolbarTextBoxWrapper>
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={this.isDarkModeOrPrivateMode.bind(this, LightShieldIcon, DarkShieldIcon)} size={24}
						isShowing={userConfig.get('adBlock.isEnabled')} isRight={true} isMarginLeft={true} isEnabled={true} title={String(lang.window.toolBar.extensions.adBlock).replace(/{replace}/, this.blockCount)} onClick={() => { this.props.addTab(`${protocolStr}://settings/`); }}>
						{this.blockCount > 0 && <ToolbarButtonBadge>{this.blockCount}</ToolbarButtonBadge>}
					</ToolbarButton>
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={this.isDarkModeOrPrivateMode.bind(this, LightFeedbackIcon, DarkFeedbackIcon)} size={24}
						isShowing={true} isRight={true} isMarginLeft={!userConfig.get('adBlock.isEnabled')} isEnabled={true} title={lang.window.toolBar.extensions.feedback} onClick={() => { ipcRenderer.send(`feedbackWindow-open`, {}); }} />
					<ToolbarDivider isDarkModeOrPrivateMode={this.getTheme()} />
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={this.props.windowId.startsWith('private') ? this.isDarkModeOrPrivateMode.bind(this, LightShieldIcon, DarkShieldIcon) : userConfig.get('profile.avatar') || this.isDarkModeOrPrivateMode.bind(this, LightAccountIcon, DarkAccountIcon)} size={24}
						isShowing={true} isRight={true} isMarginLeft={true} isEnabled={true} title={!this.props.windowId.startsWith('private') ? userConfig.get('profile.name') ?? lang.main.user : lang.main.privateMode} onClick={() => this.openMenu(true)} />
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme()} src={this.isDarkModeOrPrivateMode.bind(this, LightMoreIcon, DarkMoreIcon)} size={24}
						isShowing={true} isRight={true} isMarginLeft={false} isEnabled={true} title={lang.window.toolBar.menu.name} onClick={() => this.openMenu()} />
				</Toolbar>
				<BookmarkBar isDarkModeOrPrivateMode={this.getTheme()} isShowing={isBookmarkBar}>
					<BookmarkBarComponent bookmarks={this.state.bookMarks} windowId={this.props.windowId} isDarkModeOrPrivateMode={this.getTheme()} />
				</BookmarkBar>
			</ContentWrapper>
		);
	}
}

class MainWindow extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isFullScreenToolbar: false,
			tabs: [],
			current: 0
		};

		ipcRenderer.on(`window-fullScreen-toolBar-${this.props.match.params.windowId}`, (e, args) => {
			this.setState({ isFullScreenToolbar: args.result });
			this.forceUpdate();
		});

		ipcRenderer.on(`window-fullScreen-${this.props.match.params.windowId}`, (e, args) => {
			this.setState({ isFullScreenToolbar: false });
			this.forceUpdate();
		});

		ipcRenderer.on(`window-maximized-${this.props.match.params.windowId}`, (e, args) => this.forceUpdate());
		ipcRenderer.on(`window-unmaximized-${this.props.match.params.windowId}`, (e, args) => this.forceUpdate());

		ipcRenderer.on(`window-focus-${this.props.match.params.windowId}`, (e, args) => this.forceUpdate());
		ipcRenderer.on(`window-blur-${this.props.match.params.windowId}`, (e, args) => this.forceUpdate());

		ipcRenderer.on('window-change-settings', (e, args) => this.forceUpdate());

		ipcRenderer.on(`tab-add-${this.props.match.params.windowId}`, (e, args) => {
			this.addTab(args.url);
		});

		ipcRenderer.on(`tab-get-${this.props.match.params.windowId}`, (e, args) => {
			if (args.id != null && args.view != null) {
				this.state.tabs.filter((item, i) => {
					if (args.id === item.id) {
						let newTabs = this.state.tabs.concat();
						newTabs[i] = args.view;
						this.setState({ tabs: newTabs });
						this.forceUpdate();

						console.log(this.state.tabs);
						return;
					}
				});
			} else {
				this.setState({ tabs: args.views });
				this.forceUpdate();
				return;
			}
		});

		ipcRenderer.on(`tab-select-${this.props.match.params.windowId}`, (e, args) => {
			this.setState({ current: args.id });
		});

		ipcRenderer.on(`update-navigation-state-${this.props.match.params.windowId}`, (e, args) => {
			this.state.tabs.filter((item, i) => {
				if (args.id === item.id) {
					var newTabs = this.state.tabs.concat();
					newTabs[i].isAudioStatus = args.isAudioStatus;
					this.setState({ tabs: newTabs });
					this.forceUpdate();
				}
			});
		});
	}

	componentDidMount = () => {
		Sortable.create(findDOMNode(this.tabContainer), {
			group: { name: String(this.props.match.params.windowId).startsWith('private') ? 'private' : 'window' },
			filter: '.fixed-tab',
			animation: 100
		});

		!String(this.props.match.params.windowId).startsWith('private') ? this.props.match.params.urls.split('($|$)').map((url, i) => this.addTab(decodeURIComponent(url))) : this.addTab(`${protocolStr}://home/`);
		this.getTabs();
	}

	handleContextMenu = (id) => {
		this.state.tabs.filter((item, i) => {
			if (id === item.id) {
				const menu = Menu.buildFromTemplate([
					{
						label: '新しいタブ',
						accelerator: 'CmdOrCtrl+T',
						click: () => this.addTab()
					},
					{
						label: 'タブを閉じる',
						accelerator: 'CmdOrCtrl+W',
						click: () => this.removeTab(id)
					},
					{ type: 'separator' },
					{
						label: item.isAudioStatus === -1 ? lang.window.view.contextMenu.media.audioMuteExit : lang.window.view.contextMenu.media.audioMute,
						icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/audio${item.isAudioStatus === -1 ? '' : '_mute'}.png`,
						click: () => ipcRenderer.send(`browserView-audioMute-${this.props.match.params.windowId}`, { id })
					},
					{
						type: 'checkbox',
						label: 'タブを固定',
						checked: item.isFixed,
						click: () => ipcRenderer.send(`tab-fixed-${this.props.match.params.windowId}`, { id, result: !item.isFixed })
					}
				]);
				menu.popup(remote.getCurrentWindow());
			}
		});
	}

	handleTabIconError = (e) => {
		e.target.src = this.isDarkModeOrPrivateMode(LightPublicIcon, DarkPublicIcon);
	}

	addTab = (url = (userConfig.get('homePage.newTab.isDefaultHomePage') ? `${protocolStr}://home/` : userConfig.get('homePage.newTab.defaultPage'))) => {
		ipcRenderer.send(`tab-add-${this.props.match.params.windowId}`, { url, isActive: true });
		// ipcRenderer.send(`tab-get-${this.props.match.params.windowId}`, {});
		this.setState({ current: this.state.tabs.length });
	}

	removeTab = (i) => {
		ipcRenderer.send(`tab-remove-${this.props.match.params.windowId}`, { id: i });
		ipcRenderer.send(`tab-get-${this.props.match.params.windowId}`, {});

		this.forceUpdate();
		if ((this.state.tabs.length - 1) < 1)
			remote.getCurrentWindow().close();
	}

	getTabIcon = (id, url, icon) => {
		const u = parse(url);

		if (u.protocol === `${protocolStr}:`)
			if (u.hostname === 'home')
				return this.isDarkModeOrPrivateMode(LightHomeIcon, DarkHomeIcon);
			else if (u.hostname === 'bookmarks')
				return this.isDarkModeOrPrivateMode(LightBookmarksIcon, DarkBookmarksIcon);
			else if (u.hostname === 'history')
				return this.isDarkModeOrPrivateMode(LightHistoryIcon, DarkHistoryIcon);
			else if (u.hostname === 'downloads')
				return this.isDarkModeOrPrivateMode(LightDownloadsIcon, DarkDownloadsIcon);
			else if (u.hostname === 'settings')
				return this.isDarkModeOrPrivateMode(LightSettingsIcon, DarkSettingsIcon);
			else
				return this.isDarkModeOrPrivateMode(LightInformationIcon, DarkInformationIcon);
		else if (u.protocol === `${fileProtocolStr}:` || u.protocol === 'file:')
			return this.isDarkModeOrPrivateMode(LightInformationIcon, DarkInformationIcon);
		else
			return icon !== undefined ? icon : this.isDarkModeOrPrivateMode(LightPublicIcon, DarkPublicIcon);
	}

	getTab = (id) => {
		ipcRenderer.send(`tab-get-${this.props.match.params.windowId}`, { id });
	}

	getTabs = () => {
		ipcRenderer.send(`tab-get-${this.props.match.params.windowId}`, {});
	}

	getForegroundColor = (hexColor) => {
		var r = parseInt(hexColor.substr(1, 2), 16);
		var g = parseInt(hexColor.substr(3, 2), 16);
		var b = parseInt(hexColor.substr(5, 2), 16);

		return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? '#ffffff' : '#000000';
	}

	getColor = () => {
		return !String(this.props.match.params.windowId).startsWith('private') ? (platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#1c1c1c') : '#1c1c1c';
	}

	getTheme = () => {
		if (!String(this.props.match.params.windowId).startsWith('private')) {
			const userTheme = String(userConfig.get('design.theme')).toLowerCase();
			const baseTheme = String(window.require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme.base).toLowerCase();

			if (userTheme === 'system' || baseTheme === 'system')
				return nativeTheme.shouldUseDarkColors;
			else if (userTheme === 'light' || baseTheme === 'light')
				return false;
			else if (userTheme === 'dark' || baseTheme === 'dark')
				return true;
		} else {
			return true;
		}
	}

	isDarkModeOrPrivateMode = (lightMode, darkMode) => {
		return !this.getTheme() ? lightMode : darkMode;
	}

	closeWindow = () => {
		if (this.state.tabs.length > 1) {
			if (userConfig.get('window.isCloseConfirm')) {
				dialog.showMessageBox({
					type: 'info',
					title: 'アプリ終了確認',
					message: `${this.state.tabs.length}個のタブを閉じようとしています。`,
					detail: `${this.state.tabs.length}個のタブを閉じてアプリを終了しようとしています。\n複数のタブを閉じてアプリを終了してもよろしいでしょうか？`,
					checkboxLabel: lang.main.doNotShowAgein,
					checkboxChecked: false,
					noLink: true,
					buttons: [lang.main.yes, lang.main.no],
					defaultId: 0,
					cancelId: 1
				}).then((result) => {
					const { response, checkboxChecked } = result;

					if (checkboxChecked)
						userConfig.set('window.isCloseConfirm', false);
					if (response === 0)
						remote.getCurrentWindow().close();
				});
			} else {
				remote.getCurrentWindow().close();
			}
		} else {
			remote.getCurrentWindow().close();
		}
	}

	render() {
		const themeConfig = window.require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme;

		return (
			<Window activeBackgroundColor={getOrDefault(themeConfig.window.border.active, this.getColor())} inActiveBackgroundColor={getOrDefault(themeConfig.window.border.inActive, this.getColor())}
				isCustomTitlebar={userConfig.get('design.isCustomTitlebar')} isActive={remote.getCurrentWindow().isFocused()} isMac={platform.isDarwin} isMaximized={remote.getCurrentWindow().isMaximized() || remote.getCurrentWindow().isFullScreen()}>
				<Titlebar activeBackgroundColor={getOrDefault(themeConfig.window.titleBar.active, this.getColor())} inActiveBackgroundColor={getOrDefault(themeConfig.window.titleBar.inActive, this.getColor())}
					isActive={remote.getCurrentWindow().isFocused()} isShowing={!remote.getCurrentWindow().isFullScreen() || remote.getCurrentWindow().isFullScreen() && !this.state.isFullScreenToolbar}>
					<TabsContainer isCustomTitlebar={userConfig.get('design.isCustomTitlebar')} isWindowsOrLinux={platform.isWin32 || (!platform.isWin32 && !platform.isDarwin)}>
						<TabContainer ref={ref => { this.tabContainer = ref; }}>
							{this.state.tabs.map((tab, i) => {
								const isActive = tab.id === this.state.current
								return (
									<Tab key={i} backgroundColor={getOrDefault(themeConfig.tab.background, !this.getTheme() ? '#f9f9fa' : '#353535')} foregroundColor={getOrDefault(themeConfig.tab.foreground, !this.getTheme() ? 'black' : 'white')} inActiveForegroundColor={this.getForegroundColor(themeConfig.window.foreground) === '#000000' ? 'white' : 'black'}
										isDarkModeOrPrivateMode={this.getTheme()} isMaximized={remote.getCurrentWindow().isMaximized() || remote.getCurrentWindow().isFullScreen()} isActive={isActive} isFixed={tab.isFixed} accentColor={tab.color}
										className={tab.isFixed ? 'fixed-tab' : ''} onClick={() => { if (tab.id !== this.state.current) { this.setState({ current: tab.id }); ipcRenderer.send(`tab-select-${this.props.match.params.windowId}`, { id: tab.id }); } this.forceUpdate(); }} onContextMenu={this.handleContextMenu.bind(this, tab.id)} title={tab.title}>
										<TabIcon src={this.getTabIcon(tab.id, tab.url, tab.icon)} width={18} height={18} onError={this.handleTabIconError} />
										<TabTitle isShowing={tab.isAudioStatus !== 0} isFixed={tab.isFixed}>{tab.title}</TabTitle>
										<TabStatusIcon isActive={isActive} isFixed={tab.isFixed} isRight={true} src={tab.isAudioStatus !== 0 ? (isActive ? this.isDarkModeOrPrivateMode.bind(this, tab.isAudioStatus === 1 ? LightAudioIcon : LightAudioMuteIcon, tab.isAudioStatus === 1 ? DarkAudioIcon : DarkAudioMuteIcon) : (this.getForegroundColor(themeConfig.window.foreground) === '#000000' ? (tab.isAudioStatus === 1 ? DarkAudioIcon : DarkAudioMuteIcon) : (tab.isAudioStatus === 1 ? LightAudioIcon : LightAudioMuteIcon))) : undefined} isShowing={tab.isAudioStatus !== 0} size={14} title={tab.isAudioStatus !== 0 ? (tab.isAudioStatus === 1 ? lang.window.titleBar.tab.media.audioPlaying : lang.window.titleBar.tab.media.audioMuted) : ''} />
										<TabCloseButton isActive={isActive} isFixed={tab.isFixed} isRight={true} src={isActive ? this.isDarkModeOrPrivateMode.bind(this, LightCloseIcon, DarkCloseIcon) : (this.getForegroundColor(themeConfig.window.foreground) === '#000000' ? DarkCloseIcon : LightCloseIcon)} size={14} isDarkModeOrPrivateMode={this.getTheme()} title={lang.window.titleBar.tab.close} onClick={() => { this.removeTab(tab.id); this.forceUpdate(); }} />
									</Tab>
								);
							})}
						</TabContainer>
						<TabButton isRight={true} src={this.getForegroundColor(themeConfig.window.foreground) === '#000000' ? DarkAddIcon : LightAddIcon} size={24} isDarkModeOrPrivateMode={this.getTheme()} title={lang.window.titleBar.tab.new} onClick={() => { this.addTab(); }} />
					</TabsContainer>
					<WindowButtons isMaximized={remote.getCurrentWindow().isMaximized()} isCustomTitlebar={userConfig.get('design.isCustomTitlebar')} isWindowsOrLinux={platform.isWin32 || (!platform.isWin32 && !platform.isDarwin)}>
						<WindowsControl
							minimize
							whiteIcon={this.getForegroundColor(themeConfig.window.foreground) === '#000000'}
							title={lang.window.titleBar.buttons.minimize}
							onClick={() => {
								remote.getCurrentWindow().minimize();
								this.forceUpdate();
							}}
						/>
						<WindowsControl
							maximize={!remote.getCurrentWindow().isMaximized()}
							restore={remote.getCurrentWindow().isMaximized()}
							whiteIcon={this.getForegroundColor(themeConfig.window.foreground) === '#000000'}
							title={remote.getCurrentWindow().isMaximized() ? lang.window.titleBar.buttons.maximize.restore : lang.window.titleBar.buttons.maximize.maximize}
							onClick={() => {
								remote.getCurrentWindow().isMaximized()
									? remote.getCurrentWindow().restore()
									: remote.getCurrentWindow().maximize();
								this.forceUpdate();
							}}
						/>
						<WindowsControl
							close
							whiteIcon={this.getForegroundColor(themeConfig.window.foreground) === '#000000'}
							title={lang.window.titleBar.buttons.close}
							onClick={this.closeWindow}
						/>
					</WindowButtons>
				</Titlebar>
				<WindowContent backgroundColor={getOrDefault(themeConfig.toolBar.background, !this.getTheme() ? '#f9f9fa' : '#353535')}>
					{this.state.tabs.map((tab, i) => (
						<TabContent key={i} isActive={tab.id === this.state.current}>
							<BrowserView windowId={this.props.match.params.windowId}
								index={tab.id} url={tab.url}
								closeWindow={() => { this.closeWindow(); }}
								addTab={(url) => { this.addTab(url); }}
								updateTab={() => { this.getTab(tab.id); }} />
						</TabContent>
					))}
				</WindowContent>
			</Window>
		);
	}
}

export default MainWindow;