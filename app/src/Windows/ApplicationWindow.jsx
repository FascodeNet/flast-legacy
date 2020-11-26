import React, { Component } from 'react';
import { WindowsControl } from 'react-windows-controls';

import Window from './Components/Window';
import WindowButtons from './Components/WindowButtons';
import WindowButton from './Components/WindowButton';
import WindowContent from './Components/WindowContent';
import { Titlebar } from './Components/Titlebar';
import Toolbar from './Components/Toolbar';
import { ToolbarButton } from './Components/ToolbarButton';

import DarkBackIcon from './Resources/dark/arrow_back.svg';
import LightBackIcon from './Resources/light/arrow_back.svg';
import DarkForwardIcon from './Resources/dark/arrow_forward.svg';
import LightForwardIcon from './Resources/light/arrow_forward.svg';
import DarkReloadIcon from './Resources/dark/reload.svg';
import LightReloadIcon from './Resources/light/reload.svg';
import DarkCloseIcon from './Resources/dark/close.svg';
import LightCloseIcon from './Resources/light/close.svg';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/themes/light-border.css';
import 'tippy.js/themes/material.css';
import 'tippy.js/themes/translucent.css';

import { isURL, prefixHttp } from '../Utils/URL';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeImage, clipboard, nativeTheme } = remote;

const pkg = window.require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const platform = window.require('electron-platform');
const { parse, format } = window.require('url');
const path = window.require('path');
const process = window.require('process');

const Config = window.require('electron-store');
const config = new Config();
const userConfig = new Config({
	cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = window.require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

const getOrDefault = (value, defaultValue) => {
	return value !== undefined && value !== null && value != 'auto' ? value : defaultValue;
}

class ApplicationWindow extends Component {

	constructor(props) {
		super(props);

		ipcRenderer.on(`window-maximized-${this.props.match.params.windowId}`, (e, args) => {
			this.forceUpdate();
		});
		ipcRenderer.on(`window-unmaximized-${this.props.match.params.windowId}`, (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on(`window-focus-${this.props.match.params.windowId}`, (e, args) => {
			this.forceUpdate();
		});
		ipcRenderer.on(`window-blur-${this.props.match.params.windowId}`, (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});
	}

	componentDidMount = () => {
		let webView = this.webView;

		webView.addEventListener('did-finish-load', (e) => {
			document.title = webView.getTitle();
			this.forceUpdate();
		}, false);

		webView.addEventListener('page-title-updated', (e) => {
			document.title = webView.getTitle();
			this.forceUpdate();
		}, false);

		webView.addEventListener('new-window', (e) => {
			webView.loadURL(e.url);
		});

		webView.addEventListener('context-menu', (e) => {
			if (webView.webContents.isDestroyed()) return;

			const params = e.params;

			let menu = Menu.buildFromTemplate(
				[
					{
						label: lang.window.view.contextMenu.back,
						icon: `${app.getAppPath()}/static/${!webView.canGoBack() ? 'arrow_back_inactive' : 'light/arrow_back'}.png`,
						accelerator: 'Alt+Left',
						enabled: webView.canGoBack(),
						click: () => {
							const url = webView.getURL();

							webView.goBack();
							if (url.startsWith(`${protocolStr}://error`)) {
								if (webView.canGoBack())
									webView.goBack();
							}
						}
					},
					{
						label: lang.window.view.contextMenu.forward,
						icon: `${app.getAppPath()}/static/${!webView.canGoForward() ? 'arrow_forward_inactive' : 'light/arrow_forward'}.png`,
						accelerator: 'Alt+Right',
						enabled: webView.canGoForward(),
						click: () => {
							const url = webView.getURL();

							webView.goForward();
							if (url.startsWith(`${protocolStr}://error`)) {
								if (webView.canGoForward())
									webView.goForward();
							}
						}
					},
					{
						label: !webView.isLoadingMainFrame() ? lang.window.view.contextMenu.reload.reload : lang.window.view.contextMenu.reload.stop,
						icon: `${app.getAppPath()}/static/light/${!webView.isLoadingMainFrame() ? 'refresh' : 'close'}.png`,
						accelerator: 'CmdOrCtrl+R',
						click: () => { !webView.isLoadingMainFrame() ? webView.reload() : webView.stop(); }
					},
					...(params.mediaType === 'audio' || params.mediaType === 'video' || webView.isCurrentlyAudible() ? [
						{ type: 'separator' },
						{
							label: webView.isAudioMuted() ? lang.window.view.contextMenu.media.audioMuteExit : lang.window.view.contextMenu.media.audioMute,
							icon: `${app.getAppPath()}/static/light/audio${webView.isAudioMuted() ? '' : '_mute'}.png`,
							click: () => {
								webView.setAudioMuted(!webView.isAudioMuted());

								this.getViews();
							}
						}
					] : []),
					{ type: 'separator' },
					{
						label: lang.window.view.contextMenu.savePage,
						icon: `${app.getAppPath()}/static/light/save.png`,
						accelerator: 'CmdOrCtrl+S',
						enabled: !webView.getURL().startsWith(`${protocolStr}://`),
						click: () => {
							dialog.showSaveDialog({
								defaultPath: `${app.getPath('downloads')}/${webView.getTitle()}.html`,
								filters: [
									{ name: 'HTML', extensions: ['htm', 'html'] },
									{ name: 'All Files', extensions: ['*'] }
								]
							}, (fileName) => {
								if (fileName === undefined || fileName === null) return;
								webView.savePage(fileName, 'HTMLComplete', (err) => {
									if (!err) console.log('Page Save successfully');
								});
							});
						}
					},
					{
						label: lang.window.view.contextMenu.print,
						icon: `${app.getAppPath()}/static/light/print.png`,
						accelerator: 'CmdOrCtrl+P',
						enabled: !webView.getURL().startsWith(`${protocolStr}://`),
						click: () => { webView.print(); }
					},
					{ type: 'separator' },
					{
						label: lang.window.view.contextMenu.devTool,
						accelerator: 'CmdOrCtrl+Shift+I',
						enabled: !webView.getURL().startsWith(`${protocolStr}://`),
						click: () => { webView.openDevTools(); }
					}
				]
			);

			menu.popup(remote.getCurrentWindow());
		}, false);
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
		const userTheme = String(userConfig.get('design.theme')).toLowerCase();
		const baseTheme = String(window.require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme.base).toLowerCase();

		if (userTheme === 'system' || baseTheme === 'system')
			return nativeTheme.shouldUseDarkColors;
		else if (userTheme === 'light' || baseTheme === 'light')
			return false;
		else if (userTheme === 'dark' || baseTheme === 'dark')
			return true;
	}

	isDarkModeOrPrivateMode = (lightMode, darkMode) => {
		return !(this.getTheme() || String(this.props.match.params.windowId).startsWith('private')) ? lightMode : darkMode;
	}

	render() {
		const themeConfig = window.require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme;

		return (
			<Window activeBackgroundColor={getOrDefault(themeConfig.window.border.active, this.getColor())} inActiveBackgroundColor={getOrDefault(themeConfig.window.border.inActive, this.getColor())}
				isCustomTitlebar={userConfig.get('design.isCustomTitlebar')} isActive={remote.getCurrentWindow().isFocused()} isMaximized={remote.getCurrentWindow().isMaximized() || remote.getCurrentWindow().isFullScreen()}>
				<Titlebar activeBackgroundColor={getOrDefault(themeConfig.window.titleBar.active, this.getColor())} inActiveBackgroundColor={getOrDefault(themeConfig.window.titleBar.inActive, this.getColor())} style={{ display: 'flex' }}>
					<WindowButtons isCustomTitlebar={userConfig.get('design.isCustomTitlebar')} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)}>
						<WindowButton isClose={true} isMinimize={false} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)} title={lang.window.titleBar.buttons.close} onClick={() => { this.closeWindow(); }} />
						<WindowButton isClose={false} isMinimize={true} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)} title={lang.window.titleBar.buttons.minimize} onClick={() => { remote.getCurrentWindow().minimize(); }} />
						<WindowButton isClose={false} isMinimize={false} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)} title={remote.getCurrentWindow().isMaximized() ? lang.window.titleBar.buttons.maximize.restore : lang.window.titleBar.buttons.maximize.maximize} onClick={() => { remote.getCurrentWindow().isMaximized() ? remote.getCurrentWindow().unmaximize() : remote.getCurrentWindow().maximize(); this.forceUpdate(); }} />
					</WindowButtons>
					<Toolbar style={{ width: 'fit-content', height: '100%', background: 'transparent', border: 'none', WebkitAppRegion: 'no-drag' }} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme')}>
						<ToolbarButton isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme')} style={{ height: 'auto' }} src={this.getForegroundColor(themeConfig.window.foreground) === '#000000' ? DarkBackIcon : LightBackIcon} size={24}
							isShowing={true} isRight={false} isMarginLeft={true} isEnabled={this.webView !== undefined ? remote.webContents.fromId(this.webView.getWebContentsId()).canGoBack() : false} title={lang.window.toolBar.back} onClick={() => { remote.webContents.fromId(this.webView.getWebContentsId()).goBack(); this.forceUpdate(); }} />
						<ToolbarButton isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme')} style={{ height: 'auto' }} src={this.getForegroundColor(themeConfig.window.foreground) === '#000000' ? DarkForwardIcon : DarkForwardIcon} size={24}
							isShowing={this.webView !== undefined ? remote.webContents.fromId(this.webView.getWebContentsId()).canGoForward() : false} isRight={false} isMarginLeft={false} isEnabled={this.webView != undefined ? remote.webContents.fromId(this.webView.getWebContentsId()).canGoForward() : false} title={lang.window.toolBar.forward} onClick={() => { remote.webContents.fromId(this.webView.getWebContentsId()).goForward(); this.forceUpdate(); }} />
						<ToolbarButton isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme')} style={{ height: 'auto' }} src={this.webView != undefined && remote.webContents.fromId(this.webView.getWebContentsId()).isLoadingMainFrame() ? (this.getForegroundColor(themeConfig.window.foreground) === '#000000' ? DarkCloseIcon : LightCloseIcon) : (this.getForegroundColor(themeConfig.window.foreground) === '#000000' ? DarkReloadIcon : LightReloadIcon)} size={24}
							isShowing={true} isRight={false} isMarginLeft={false} isEnabled={true} title={this.webView !== undefined && remote.webContents.fromId(this.webView.getWebContentsId()).isLoadingMainFrame() ? lang.window.toolBar.reload.stop : lang.window.toolBar.reload.reload} onClick={() => { if (remote.webContents.fromId(this.webView.getWebContentsId()).isLoadingMainFrame()) { remote.webContents.fromId(this.webView.getWebContentsId()).stop(); } else { remote.webContents.fromId(this.webView.getWebContentsId()).reload(); } this.forceUpdate(); }} />
					</Toolbar>
					<span style={{ color: this.getForegroundColor(themeConfig.window.foreground) === '#000000' ? 'white' : 'black', marginLeft: 10, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', fontFamily: '"Noto Sans", "Noto Sans JP"' }}>{this.webView != undefined ? remote.webContents.fromId(this.webView.getWebContentsId()).getTitle() : 'Application'}</span>
					<WindowButtons isMaximized={remote.getCurrentWindow().isMaximized()} isCustomTitlebar={userConfig.get('design.isCustomTitlebar')} isWindowsOrLinux={platform.isWin32 || (!platform.isWin32 && !platform.isDarwin)}>
						<WindowsControl
							minimize
							whiteIcon={this.getForegroundColor(themeConfig.window.foreground) === '#000000'}
							disabled={!remote.getCurrentWindow().minimizable}
							title={lang.window.titleBar.buttons.minimize}
							onClick={() => {
								if (!remote.getCurrentWindow().minimizable) return;
								remote.getCurrentWindow().minimize();
								this.forceUpdate();
							}}
						/>
						<WindowsControl
							maximize={!remote.getCurrentWindow().isMaximized()}
							restore={remote.getCurrentWindow().isMaximized()}
							whiteIcon={this.getForegroundColor(themeConfig.window.foreground) === '#000000'}
							disabled={!remote.getCurrentWindow().maximizable}
							title={remote.getCurrentWindow().isMaximized() ? lang.window.titleBar.buttons.maximize.restore : lang.window.titleBar.buttons.maximize.maximize}
							onClick={() => {
								if (!remote.getCurrentWindow().maximizable) return;
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
							onClick={() => {
								remote.getCurrentWindow().close();
								this.forceUpdate();
							}}
						/>
					</WindowButtons>
				</Titlebar>
				<WindowContent>
					<webview ref={(ref) => this.webView = ref} style={{ height: '100%' }} src={decodeURIComponent(this.props.match.params.url)} preload={`${app.getAppPath()}/electron/Preloads/Preload`} />
				</WindowContent>
			</Window>
		);
	}
}

export default ApplicationWindow;