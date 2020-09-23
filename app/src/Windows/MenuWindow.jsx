import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { parse, format } from 'url';
import QRCode from 'qrcode.react';

import DarkBackIcon from './Resources/dark/arrow_back.svg';
import LightBackIcon from './Resources/light/arrow_back.svg';
import DarkCloseIcon from './Resources/dark/close.svg';
import LightCloseIcon from './Resources/light/close.svg';

import DarkAccountIcon from './Resources/dark/account.svg';
import LightAccountIcon from './Resources/light/account.svg';
import DarkTabIcon from './Resources/dark/tab.svg';
import LightTabIcon from './Resources/light/tab.svg';
import DarkWindowIcon from './Resources/dark/window.svg';
import LightWindowIcon from './Resources/light/window.svg';
import IncognitoIcon from './Resources/incognito.svg';
import DarkIncognitoIcon from './Resources/dark/incognito.svg';
import LightIncognitoIcon from './Resources/light/incognito.svg';
import DarkZoomInIcon from './Resources/dark/zoom_in.svg';
import LightZoomInIcon from './Resources/light/zoom_in.svg';
import DarkZoomOutIcon from './Resources/dark/zoom_out.svg';
import LightZoomOutIcon from './Resources/light/zoom_out.svg';
import DarkFullScreenIcon from './Resources/dark/fullscreen.svg';
import LightFullScreenIcon from './Resources/light/fullscreen.svg';
import DarkBookmarksIcon from './Resources/dark/bookmarks.svg';
import LightBookmarksIcon from './Resources/light/bookmarks.svg';
import DarkHistoryIcon from './Resources/dark/history.svg';
import LightHistoryIcon from './Resources/light/history.svg';
import DarkDownloadsIcon from './Resources/dark/downloads.svg';
import LightDownloadsIcon from './Resources/light/downloads.svg';
import DarkAppsIcon from './Resources/dark/apps.svg';
import LightAppsIcon from './Resources/light/apps.svg';
import DarkPrintIcon from './Resources/dark/print.svg';
import LightPrintIcon from './Resources/light/print.svg';
import DarkFindIcon from './Resources/dark/find.svg';
import LightFindIcon from './Resources/light/find.svg';
import DarkShareIcon from './Resources/dark/share.svg';
import LightShareIcon from './Resources/light/share.svg';
import DarkSettingsIcon from './Resources/dark/settings.svg';
import LightSettingsIcon from './Resources/light/settings.svg';
import DarkHelpOutlineIcon from './Resources/dark/help_outline.svg';
import LightHelpOutlineIcon from './Resources/light/help_outline.svg';

import DarkSaveIcon from './Resources/dark/save.svg';
import LightSaveIcon from './Resources/light/save.svg';
import DarkCopyIcon from './Resources/dark/copy.svg';
import LightCopyIcon from './Resources/light/copy.svg';
import DarkInformationIcon from './Resources/dark/information.svg';
import LightInformationIcon from './Resources/light/information.svg';
import DarkFeedbackIcon from './Resources/dark/feedback.svg';
import LightFeedbackIcon from './Resources/light/feedback.svg';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme, clipboard } = remote;

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

const buttonHeight = 30;

const Window = styled.div`
  width: auto;
  height: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'auto' : '100%'};
  margin: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '0px 4px 2px' : '0px'};
  padding: 5px 0px;
  display: flex;
  flex-direction: column;
  border-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'none' : (props => !props.dark ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.dark ? '#f9f9fa' : '#353535'};
  color: ${props => !props.dark ? '#353535' : '#f9f9fa'};
  box-shadow: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '0px 2px 4px rgba(0, 0, 0, 0.16), 0px 2px 4px rgba(0, 0, 0, 0.23)' : 'none'};
  font-family: 'Noto Sans', 'Noto Sans JP';
  box-sizing: border-box;
`;

const StyledButton = styled.div`
  width: 100%;
  height: ${buttonHeight}px;
  margin: 0px;
  padding: 0px 7px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  background: none;
  transition: 0.2s background-color;
  font-family: 'Noto Sans', 'Noto Sans JP';

  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;

const StyledButtonIcon = styled.img`
  width: 18px;
  height: 18px;
`;

const StyledButtonIconSkeleton = styled.div`
  width: 18px;
  height: 18px;
`;

const StyledButtonTitle = styled.span`
  width: auto;
  margin-left: 5px;
`;

const StyledButtonAccelerator = styled.span`
  width: auto;
  margin-left: auto;
  margin-right: ${props => props.isMoreIcon ? 8 : 20}px;
`;

const Divider = styled.div`
  background-color: initial;
  width: ${props => (props.isVertical ?? false) ? '1px' : '100%'};
  height: ${props => (props.isVertical ?? false) ? `${buttonHeight}px` : '1px'};
  margin-top: ${props => (props.isVertical ?? false) ? 0 : 5}px;
  margin-bottom: ${props => (props.isVertical ?? false) ? 0 : 5}px;
  margin-left: ${props => (props.isVertical ?? false) ? 5 : 0}px;
  margin-right: ${props => (props.isVertical ?? false) ? 5 : 0}px;
  ${props => (props.isVertical ?? false) ? 'border-left' : 'border-top'}: solid 1px ${props => !props.dark ? '#e1e1e1' : '#8b8b8b'};
`;

const Dialog = styled.div`
  width: -webkit-fill-available;
  height: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '581px' : '100%'};
  margin: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '0px 4px 2px' : '0px'};
  padding: 0px;
  position: fixed;
  top: 0px;
  transform: translateX(${props => props.isOpen ? '0%' : '105%'});
  display: flex;
  flex-flow: column nowrap;
  border-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'none' : (props => !props.dark ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.dark ? '#f9f9fa' : '#353535'};
  color: ${props => !props.dark ? '#353535' : '#f9f9fa'};
  transition: 0.2s transform;
  font-family: 'Noto Sans', 'Noto Sans JP';
  box-sizing: border-box;
`;

const DialogHeader = styled.div`
  width: 100%;
  height: 35px;
  margin: 0px;
  padding: 0px;
  display: flex;
  background-color: gray;
  border-top-left-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border-top-right-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  box-sizing: border-box;
`;

const DialogHeaderButton = styled.div`
  width: 25px;
  height: 25px;
  margin: 5px;
  padding: 3px;
  position: relative;
  flex-grow: 0;
  background-image: url(${props => props.src});
  background-size: ${props => props.size}px;
  background-position: center;
  background-repeat: no-repeat;
  background-color: initial;
  border: none;
  border-radius: 2px;
  transition: 0.2s background-color;
  outline: none;
  &:hover {
    background-color: ${props => !props.dark ? 'rgba(0, 0, 0, 0.06)' : 'rgba(130, 130, 130, 0.3)'};
  }
`;

const DialogHeaderTitle = styled.span`
  margin: 0 auto;
  display: flex;
  align-items: center;
  font-family: 'Noto Sans', 'Noto Sans JP';
  color: #f9f9fa;
`;

const DialogContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 5px 0px;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border-bottom-right-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'none' : (props => !props.dark ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.dark ? '#f9f9fa' : '#353535'};
  color: ${props => !props.dark ? '#353535' : '#f9f9fa'};
  box-sizing: border-box;
`;

class MoreIcon extends Component {
	render() {
		return (
			<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 59.414 59.414" style={{ display: this.props.visibility ? 'block' : 'none' }}>
				<g>
					<polygon fill={this.props.dark ? '#e1e1e1' : '#8b8b8b'} points="15.561,59.414 14.146,58 42.439,29.707 14.146,1.414 15.561,0 45.268,29.707"></polygon>
				</g>
			</svg>
		);
	}
}

class Button extends Component {

	getTheme = () => {
		if (String(this.props.windowId).startsWith('private')) return true;

		const userTheme = String(userConfig.get('design.theme')).toLowerCase();
		const baseTheme = String(window.require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme.base).toLowerCase();

		if (userTheme === 'system' || baseTheme === 'system')
			return nativeTheme.shouldUseDarkColors;
		else if (userTheme === 'light' || baseTheme === 'light')
			return false;
		else if (userTheme === 'dark' || baseTheme === 'dark')
			return true;
	}

	render() {
		return (
			<StyledButton onClick={this.props.onClick}>
				{this.props.icon ? <StyledButtonIcon src={this.props.icon} /> : <StyledButtonIconSkeleton />}
				<StyledButtonTitle>{this.props.title}</StyledButtonTitle>
				<StyledButtonAccelerator isMoreIcon={this.props.isMoreIcon ?? false}>{this.props.accelerator}</StyledButtonAccelerator>
				<MoreIcon dark={this.getTheme()} visibility={this.props.isMoreIcon ?? false} />
			</StyledButton>
		);
	}
}

class DialogButton extends Component {

	getTheme = () => {
		if (String(this.props.windowId).startsWith('private')) return true;

		const userTheme = String(userConfig.get('design.theme')).toLowerCase();
		const baseTheme = String(window.require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme.base).toLowerCase();

		if (userTheme === 'system' || baseTheme === 'system')
			return nativeTheme.shouldUseDarkColors;
		else if (userTheme === 'light' || baseTheme === 'light')
			return false;
		else if (userTheme === 'dark' || baseTheme === 'dark')
			return true;
	}

	render() {
		return (
			<StyledButton onClick={this.props.onClick} style={{ height: buttonHeight * 2, padding: '0px 14px' }}>
				{this.props.icon ? <StyledButtonIcon src={this.props.icon} /> : <StyledButtonIconSkeleton />}
				<StyledButtonTitle>{this.props.title}</StyledButtonTitle>
				<StyledButtonAccelerator isMoreIcon={this.props.isMoreIcon ?? false}>{this.props.accelerator}</StyledButtonAccelerator>
				<MoreIcon dark={this.getTheme()} visibility={this.props.isMoreIcon ?? false} />
			</StyledButton>
		);
	}
}

class MenuWindow extends Component {

	constructor(props) {
		super(props);

		this.state = {
			windowId: '',
			tabId: '',
			url: '',
			zoomLevel: 1,
			isOpen: null
		};

		window.addEventListener('blur', () => {
			this.setState({ isOpen: null });
		});

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on(`menuWindow-${remote.getCurrentWindow().id}`, (e, args) => {
			this.setState({ windowId: args.windowId, tabId: args.tabId, isOpen: args.type ?? null, url: args.url, zoomLevel: args.zoomLevel });
			this.forceUpdate();
		});

		ipcRenderer.on(`browserView-zoom-menu-${remote.getCurrentWindow().id}`, (e, args) => {
			this.setState({ zoomLevel: args.result });
			this.forceUpdate();
		});
	}

	componentWillUnmount = () => {
		this.setState({ isOpen: null });
	}

	getTheme = () => {
		if (String(this.state.windowId).startsWith('private')) return true;

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

			u.protocol === `${protocolStr}:` ? ipcRenderer.send(`browserView-loadURL-${this.state.windowId}`, { id: this.state.tabId, url }) : ipcRenderer.send(`tab-add-${this.state.windowId}`, { url, isActive: true });
		} else {
			ipcRenderer.send(`tab-add-${this.state.windowId}`, { url, isActive: true });
		}
	}

	closeMenu = () => {
		this.setState({ isOpen: null });
		ipcRenderer.send(`menuWindow-close-${remote.getCurrentWindow().id}`, {});
	}

	render() {
		const isPrivate = this.state.windowId.startsWith('private');
		
		return (
			<div style={{ boxSizing: 'border-box', width: '100%', height: platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'auto' : '100%' }}>
				<Window dark={this.getTheme()}>
					<Button icon={!isPrivate ? (this.getTheme() ? DarkAccountIcon : LightAccountIcon) : IncognitoIcon} isMoreIcon title={!isPrivate ? (userConfig.get('profile.name') ? `${userConfig.get('profile.name')} (${lang.window.toolBar.menu.menus.userInformation.name})` : lang.window.toolBar.menu.menus.userInformation.name) : `${lang.main.privateMode} (${lang.window.toolBar.menu.menus.userInformation.name})`} onClick={() => { this.setState({ isOpen: 'userInfo' }); }} windowId={this.state.windowId} />
					<Divider dark={this.getTheme()} />
					<Button icon={this.getTheme() ? DarkTabIcon : LightTabIcon} title={lang.window.toolBar.menu.menus.newTab} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+T`} onClick={() => { this.closeMenu(); this.addTab(); }} />
					<Button icon={this.getTheme() ? DarkWindowIcon : LightWindowIcon} title={lang.window.toolBar.menu.menus.newWindow} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+N`} onClick={() => { this.closeMenu(); ipcRenderer.send(`window-add`, { isPrivate: false }); }} windowId={this.state.windowId} />
					<Button icon={this.getTheme() ? DarkIncognitoIcon : LightIncognitoIcon} title={lang.window.toolBar.menu.menus.openPrivateWindow} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+Shift+N`} onClick={() => { this.closeMenu(); ipcRenderer.send(`window-add`, { isPrivate: true }); }} windowId={this.state.windowId} />
					<Divider style={{ marginBottom: 0 }} dark={this.getTheme()} windowId={this.state.windowId} />
					<div style={{ display: 'flex', paddingLeft: 7 }}>
						<span style={{ width: 'auto', marginLeft: 25, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', fontFamily: '"Noto Sans", "Noto Sans JP"' }}>{lang.window.toolBar.menu.menus.zoom.name}</span>
						<div style={{ display: 'flex', marginLeft: 'auto' }}>
							<StyledButton title={lang.window.toolBar.menu.menus.zoom.zoomIn} onClick={() => { ipcRenderer.send(`browserView-zoomIn-${this.state.windowId}`, { id: this.state.tabId }); this.forceUpdate(); }}
								style={{ width: 50, height: 32, padding: '4px 16px', display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', borderLeft: `solid 1px ${this.getTheme() ? '#8b8b8b' : '#e1e1e1'}` }}>
								<img src={this.getTheme() ? DarkZoomInIcon : LightZoomInIcon} width={22} style={{ verticalAlign: 'middle' }} />
							</StyledButton>
							<div style={{ width: 60, height: 32, padding: '4px 16px', display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', background: 'none', fontFamily: '"Noto Sans", "Noto Sans JP"', fontSize: 14 }}>
								{(this.state.zoomLevel * 100).toFixed(0)}%
							</div>
							<StyledButton title={lang.window.toolBar.menu.menus.zoom.zoomOut} onClick={() => { ipcRenderer.send(`browserView-zoomOut-${this.state.windowId}`, { id: this.state.tabId }); this.forceUpdate(); }}
								style={{ width: 50, height: 32, padding: '4px 16px', display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center' }}>
								<img src={this.getTheme() ? DarkZoomOutIcon : LightZoomOutIcon} width={22} style={{ verticalAlign: 'middle' }} />
							</StyledButton>
							<StyledButton title={lang.window.toolBar.menu.menus.zoom.fullScreen} onClick={() => { this.closeMenu(); ipcRenderer.send(`window-fullScreen-${this.state.windowId}`, {}); }}
								style={{ width: 50, height: 32, padding: '4px 16px', display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', borderLeft: `solid 1px ${this.getTheme() ? '#8b8b8b' : '#e1e1e1'}` }}>
								<img src={this.getTheme() ? DarkFullScreenIcon : LightFullScreenIcon} width={22} style={{ verticalAlign: 'middle' }} />
							</StyledButton>
						</div>
					</div>
					<Divider style={{ marginTop: 0, marginBottom: 0 }} dark={this.getTheme()} />
					<div style={{ display: 'flex', paddingLeft: 7 }}>
						<span style={{ width: 'auto', marginLeft: 25, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', fontFamily: '"Noto Sans", "Noto Sans JP"' }}>{lang.window.toolBar.menu.menus.edit.name}</span>
						<div style={{ display: 'flex', marginLeft: 'auto' }}>
							<StyledButton style={{ width: 70, height: 32, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', borderLeft: `solid 1px ${this.getTheme() ? '#8b8b8b' : '#e1e1e1'}` }}>
								{lang.window.toolBar.menu.menus.edit.cut}
							</StyledButton>
							<StyledButton style={{ width: 70, height: 32, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', borderLeft: `solid 1px ${this.getTheme() ? '#8b8b8b' : '#e1e1e1'}` }}>
								{lang.window.toolBar.menu.menus.edit.copy}
							</StyledButton>
							<StyledButton style={{ width: 70, height: 32, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', borderLeft: `solid 1px ${this.getTheme() ? '#8b8b8b' : '#e1e1e1'}` }}>
								{lang.window.toolBar.menu.menus.edit.paste}
							</StyledButton>
						</div>
					</div>
					<Divider style={{ marginTop: 0 }} dark={this.getTheme()} />
					<Button icon={this.getTheme() ? DarkBookmarksIcon : LightBookmarksIcon} title={lang.window.toolBar.menu.menus.bookmarks} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+B`} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://bookmarks`, true); }} windowId={this.state.windowId} />
					<Button icon={this.getTheme() ? DarkHistoryIcon : LightHistoryIcon} title={lang.window.toolBar.menu.menus.history} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+H`} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://history`, true); }} windowId={this.state.windowId} />
					<Button icon={this.getTheme() ? DarkDownloadsIcon : LightDownloadsIcon} title={lang.window.toolBar.menu.menus.downloads} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+D`} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://downloads`, true); }} windowId={this.state.windowId} />
					<Button icon={this.getTheme() ? DarkAppsIcon : LightAppsIcon} title={lang.window.toolBar.menu.menus.app.name} isMoreIcon onClick={() => this.setState({ isOpen: 'app' })} windowId={this.state.windowId} />
					<Divider dark={this.getTheme()} />
					<Button icon={this.getTheme() ? DarkPrintIcon : LightPrintIcon} title={lang.window.toolBar.menu.menus.print} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+P`} onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-print-${this.state.windowId}`, { id: this.state.tabId }); }} windowId={this.state.windowId} />
					<Button icon={this.getTheme() ? DarkFindIcon : LightFindIcon} title={lang.window.toolBar.menu.menus.find} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+F`} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://downloads`, true); }} windowId={this.state.windowId} />
					<Button icon={this.getTheme() ? DarkShareIcon : LightShareIcon} title={lang.window.toolBar.menu.menus.share.name} isMoreIcon onClick={() => this.setState({ isOpen: 'share' })} windowId={this.state.windowId} />
					<Button title={lang.window.toolBar.menu.menus.otherTools.name} isMoreIcon onClick={() => { this.setState({ isOpen: 'otherTools' }); }} windowId={this.state.windowId} />
					<Divider dark={this.getTheme()} />
					<Button icon={this.getTheme() ? DarkSettingsIcon : LightSettingsIcon} title={lang.window.toolBar.menu.menus.settings} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://settings`, true); }} windowId={this.state.windowId} />
					<Button icon={this.getTheme() ? DarkHelpOutlineIcon : LightHelpOutlineIcon} title={lang.window.toolBar.menu.menus.help.name} isMoreIcon onClick={() => this.setState({ isOpen: 'help' })} windowId={this.state.windowId} />
					<Divider dark={this.getTheme()} windowId={this.state.windowId} />
					<Button icon={this.getTheme() ? DarkCloseIcon : LightCloseIcon} title={lang.window.toolBar.menu.menus.quit} accelerator={platform.isDarwin ? 'Cmd+Q' : 'Alt+F4'} onClick={() => ipcRenderer.send('app-quit', {})} windowId={this.state.windowId} />
				</Window>
				<Dialog isOpen={this.state.isOpen === 'userInfo'} dark={this.getTheme()}>
					<DialogHeader>
						<DialogHeaderButton src={DarkBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.userInformation.name}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer dark={this.getTheme()}>
						<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', paddingTop: '6rem' }}>
							<img src={!isPrivate ? userConfig.get('profile.avatar') : IncognitoIcon} style={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', backgroundColor: !isPrivate ? 'transparent' : '#35363a' }} />
							<h4 style={{ marginBottom: 0 }}>{!isPrivate ? (userConfig.get('profile.name') || lang.main.user) : lang.main.privateMode}</h4>
						</div>
						<div style={{ marginTop: 'auto' }}>
							<Divider dark={this.getTheme()} />
							{!isPrivate ?
								<Fragment>
									<h6 style={{ margin: '5px 8px' }}>{lang.window.toolBar.menu.menus.userInformation.otherUsers}</h6>
									<DialogButton icon={this.getTheme() ? DarkAccountIcon : LightAccountIcon} title="Guest" windowId={this.state.windowId} />
								</Fragment>
								:
								<DialogButton icon={this.getTheme() ? DarkCloseIcon : LightCloseIcon} title={lang.window.toolBar.menu.menus.userInformation.endPrivateMode} windowId={this.state.windowId} />
							}
						</div>
					</DialogContainer>
				</Dialog>
				<Dialog isOpen={this.state.isOpen === 'app'} dark={this.getTheme()}>
					<DialogHeader>
						<DialogHeaderButton src={DarkBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.app.name}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer dark={this.getTheme()}>
						<Button icon={this.getTheme() || String(this.state.windowId).startsWith('private') ? DarkAppsIcon : LightAppsIcon} title={lang.window.toolBar.menu.menus.app.list} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://apps/`); }} windowId={this.state.windowId} />
						{parse(this.state.url).protocol !== `${protocolStr}:` &&
							<Fragment>
								<Divider dark={this.getTheme()} />
								<Button title={String(lang.window.toolBar.menu.menus.app.run).replace(/{title}/, lang.window.toolBar.menu.menus.app.name)} onClick={() => { this.closeMenu(); ipcRenderer.send(`appWindow-add`, { url: this.state.url }); }} windowId={this.state.windowId} />
							</Fragment>
						}
					</DialogContainer>
				</Dialog>
				<Dialog isOpen={this.state.isOpen === 'share'} dark={this.getTheme()}>
					<DialogHeader>
						<DialogHeaderButton src={DarkBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.share.name}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer dark={this.getTheme()}>
						<Button icon={this.getTheme() || String(this.state.windowId).startsWith('private') ? DarkCopyIcon : LightCopyIcon} title={lang.window.toolBar.menu.menus.share.linkCopy} onClick={() => { this.closeMenu(); clipboard.writeText(this.state.url); }} windowId={this.state.windowId} />
						{parse(this.state.url).protocol !== `${protocolStr}:` &&
							<Fragment>
								<Divider dark={this.getTheme()} />
								<div style={{ display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center' }}>
									<QRCode value={this.state.url} size={200} />
								</div>
							</Fragment>
						}
					</DialogContainer>
				</Dialog>
				<Dialog isOpen={this.state.isOpen === 'otherTools'} dark={this.getTheme()}>
					<DialogHeader>
						<DialogHeaderButton src={DarkBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.otherTools.name}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer dark={this.getTheme()}>
						<Button icon={this.getTheme() || String(this.state.windowId).startsWith('private') ? DarkSaveIcon : LightSaveIcon} title={lang.window.toolBar.menu.menus.otherTools.savePage} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+S`} onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-savePage-${this.state.windowId}`, { id: this.state.tabId }); }} windowId={this.state.windowId} />
						<Divider dark={this.getTheme()} />
						<Button title={lang.window.toolBar.menu.menus.otherTools.viewSource} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+U`} onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-viewSource-${this.state.windowId}`, { id: this.state.tabId }); }} windowId={this.state.windowId} />
						<Button title={lang.window.toolBar.menu.menus.otherTools.devTool} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+Shift+I`} onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-devTool-${this.state.windowId}`, { id: this.state.tabId }); }} windowId={this.state.windowId} />
					</DialogContainer>
				</Dialog>
				<Dialog isOpen={this.state.isOpen === 'help'} dark={this.getTheme()}>
					<DialogHeader>
						<DialogHeaderButton src={DarkBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.help.name}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer dark={this.getTheme()}>
						<Button icon={this.getTheme() || String(this.state.windowId).startsWith('private') ? DarkHelpOutlineIcon : LightHelpOutlineIcon} title={lang.window.toolBar.menu.menus.help.name} accelerator="F1" onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://settings/about`, true); }} windowId={this.state.windowId} />
						<Divider dark={this.getTheme()} />
						<Button icon={this.getTheme() || String(this.state.windowId).startsWith('private') ? DarkFeedbackIcon : LightFeedbackIcon} title={lang.window.toolBar.menu.menus.help.feedback} accelerator={`${platform.isDarwin ? 'Option' : 'Alt'}+Shift+I`} onClick={() => { this.closeMenu(); ipcRenderer.send(`feedbackWindow-open`, {}); }} windowId={this.state.windowId} />
						<Divider dark={this.getTheme()} />
						<Button icon={this.getTheme() || String(this.state.windowId).startsWith('private') ? DarkInformationIcon : LightInformationIcon} title={lang.window.toolBar.menu.menus.help.about} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://settings/about`, true); }} windowId={this.state.windowId} />
					</DialogContainer>
				</Dialog>
			</div>
		);
	}
}

export default MenuWindow;