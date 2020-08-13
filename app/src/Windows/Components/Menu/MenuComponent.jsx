import React, { Component } from 'react';
import styled from 'styled-components';
import { parse, format } from 'url';

import { Window, Button, ButtonTitle, ButtonAccelerator, Dialog, DialogContainer, DialogHeader, DialogHeaderButton, DialogHeaderTitle, Divider } from './Menu';

import DarkBackIcon from '../../Resources/dark/arrow_back.svg';
import LightBackIcon from '../../Resources/light/arrow_back.svg';

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

class MenuWindow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: '',
            zoomLevel: 1,
            isOpen: null
        };

        ipcRenderer.on('window-change-settings', (e, args) => {
            this.forceUpdate();
        });

        ipcRenderer.on(`menuWindow-${this.props.windowId}`, (e, args) => {
            this.setState({ url: args.url, zoomLevel: args.zoomLevel, isOpen: null });
            this.forceUpdate();
        });

        ipcRenderer.on(`browserView-zoom-${this.props.windowId}`, (e, args) => {
            this.setState({ zoomLevel: args.result });
        });
    }

    getForegroundColor = (hexColor) => {
        var r = parseInt(hexColor.substr(1, 2), 16);
        var g = parseInt(hexColor.substr(3, 2), 16);
        var b = parseInt(hexColor.substr(5, 2), 16);

        return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? '#ffffff' : '#000000';
    }

    addTab = (url = (userConfig.get('homePage.isDefaultHomePage') ? `${protocolStr}://home/` : userCuserConfig.get('homePage.defaultPage')), isInternal = false) => {
        if (isInternal) {
            const u = parse(this.state.url);
            console.log(u.protocol);

            if (u.protocol === `${protocolStr}:`) {
                ipcRenderer.send(`browserView-loadURL-${this.props.windowId}`, { id: this.props.match.params.tabId, url });
            } else {
                ipcRenderer.send(`tab-add-${this.props.windowId}`, { url, isActive: true });
            }
        } else {
            ipcRenderer.send(`tab-add-${this.props.windowId}`, { url, isActive: true });
        }
    }

    closeMenu = () => {
        ipcRenderer.send(`menuWindow-close-${this.props.windowId}`, {});
    }

    getIconDirectory = () => {
        return `${app.getAppPath()}/static/${userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? 'dark' : 'light'}`;
    }

    render() {
		const webView = this.props.webView;
		
        return (
            <div style={{ display: this.props.isShowing ? 'block' : 'none', width: 340, height: platform.isWin32 || platform.isDarwin ? 'auto' : '100%', position: 'relative', top: -2, left: 'calc(100% - 350px)', boxSizing: 'border-box' }}>
                <Window isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')}>
                    <Button onClick={() => { this.setState({ isOpen: 'userInfo' }); }}>
                        <img src={`${this.getIconDirectory()}/account.png`} style={{ verticalAlign: 'middle' }} />
                        <ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.userInfo}</ButtonTitle>
                        <ButtonAccelerator></ButtonAccelerator>
                        <MoreIcon isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                    </Button>
                    <Divider isVertical={false} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                    <Button onClick={() => { this.closeMenu(); this.addTab(); }}>
                        <ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.newTab}</ButtonTitle>
                        <ButtonAccelerator>{platform.isDarwin ? 'Cmd+T' : 'Ctrl+T'}</ButtonAccelerator>
                    </Button>
                    <Button onClick={() => { this.closeMenu(); ipcRenderer.send(`window-add`, { isPrivate: false }); }}>
                        <ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.newWindow}</ButtonTitle>
                        <ButtonAccelerator>{platform.isDarwin ? 'Cmd+N' : 'Ctrl+N'}</ButtonAccelerator>
                    </Button>
                    <Button onClick={() => { this.closeMenu(); ipcRenderer.send(`window-add`, { isPrivate: true }); }}>
                        <ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.openPrivateWindow}</ButtonTitle>
                        <ButtonAccelerator>{platform.isDarwin ? 'Cmd+Shift+N' : 'Ctrl+Shift+N'}</ButtonAccelerator>
                    </Button>
                    <Divider style={{ marginBottom: 0 }} isVertical={false} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                    <div style={{ display: 'flex', paddingLeft: 7 }}>
                        <span style={{ width: 'auto', marginLeft: 25, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center' }}>{lang.window.toolBar.menu.menus.zoom.name}</span>
                        <div style={{ display: 'flex', marginLeft: 'auto' }}>
                            <Button title={lang.window.toolBar.menu.menus.zoom.zoomIn} onClick={() => { ipcRenderer.send(`browserView-zoomIn-${this.props.windowId}`, { id: this.props.match.params.tabId }); this.forceUpdate(); }}
                                style={{ width: 50, height: 30, padding: '4px 16px', display: 'inline-table', borderLeft: `solid 1px ${userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
                                <img src={`${this.getIconDirectory()}/zoom_in.png`} style={{ verticalAlign: 'middle' }} />
                            </Button>
                            <div style={{ width: 50, height: 30, padding: '4px 16px', display: 'inline-table', borderLeft: `solid 1px ${userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
                                {(this.state.zoomLevel * 100).toFixed(0)}%
							</div>
                            <Button title={lang.window.toolBar.menu.menus.zoom.zoomOut} onClick={() => { ipcRenderer.send(`browserView-zoomOut-${this.props.windowId}`, { id: this.props.match.params.tabId }); this.forceUpdate(); }}
                                style={{ width: 50, height: 30, padding: '4px 16px', display: 'inline-table', borderLeft: `solid 1px ${userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
                                <img src={`${this.getIconDirectory()}/zoom_out.png`} style={{ verticalAlign: 'middle' }} />
                            </Button>
                            <Button title={lang.window.toolBar.menu.menus.zoom.fullScreen} onClick={() => { this.closeMenu(); ipcRenderer.send(`window-fullScreen-${this.props.windowId}`, {}); }}
                                style={{ width: 50, height: 30, padding: '4px 16px', display: 'inline-table', borderLeft: `solid 1px ${userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
                                <img src={`${this.getIconDirectory()}/fullscreen.png`} style={{ verticalAlign: 'middle' }} />
                            </Button>
                        </div>
                    </div>
                    <Divider style={{ marginTop: 0, marginBottom: 0 }} isVertical={false} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                    <div style={{ display: 'flex', paddingLeft: 7 }}>
                        <span style={{ width: 'auto', marginLeft: 25, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center' }}>{lang.window.toolBar.menu.menus.edit.name}</span>
                        <div style={{ display: 'flex', marginLeft: 'auto' }}>
                            <Button style={{ width: 70, height: 30, borderLeft: `solid 1px ${userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
                                {lang.window.toolBar.menu.menus.edit.cut}
                            </Button>
                            <Button style={{ width: 70, height: 30, borderLeft: `solid 1px ${userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
                                {lang.window.toolBar.menu.menus.edit.copy}
                            </Button>
                            <Button style={{ width: 70, height: 30, borderLeft: `solid 1px ${userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
                                {lang.window.toolBar.menu.menus.edit.paste}
                            </Button>
                        </div>
                    </div>
                    <Divider style={{ marginTop: 0 }} isVertical={false} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                    <Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://bookmarks`, true); }}>
                        <img src={`${this.getIconDirectory()}/bookmarks.png`} style={{ verticalAlign: 'middle' }} />
                        <ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.bookmarks}</ButtonTitle>
                        <ButtonAccelerator>{platform.isDarwin ? 'Cmd+B' : 'Ctrl+B'}</ButtonAccelerator>
                    </Button>
                    <Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://history`, true); }}>
                        <img src={`${this.getIconDirectory()}/history.png`} style={{ verticalAlign: 'middle' }} />
                        <ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.history}</ButtonTitle>
                        <ButtonAccelerator>{platform.isDarwin ? 'Cmd+H' : 'Ctrl+H'}</ButtonAccelerator>
                    </Button>
                    <Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://downloads`, true); }}>
                        <img src={`${this.getIconDirectory()}/download.png`} style={{ verticalAlign: 'middle' }} />
                        <ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.downloads}</ButtonTitle>
                        <ButtonAccelerator>{platform.isDarwin ? 'Cmd+D' : 'Ctrl+D'}</ButtonAccelerator>
                    </Button>
                    <Button onClick={() => { this.setState({ isOpen: 'app' }); }}>
                        <ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.app.name}</ButtonTitle>
                        <ButtonAccelerator></ButtonAccelerator>
                        <MoreIcon isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                    </Button>
                    <Divider isVertical={false} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                    <Button onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-print-${this.props.windowId}`, { id: this.props.match.params.tabId }); }}>
                        <img src={`${this.getIconDirectory()}/print.png`} style={{ verticalAlign: 'middle' }} />
                        <ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.print}</ButtonTitle>
                        <ButtonAccelerator>{platform.isDarwin ? 'Cmd+P' : 'Ctrl+P'}</ButtonAccelerator>
                    </Button>
                    <Button>
                        <img src={`${this.getIconDirectory()}/find.png`} style={{ verticalAlign: 'middle' }} />
                        <ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.find}</ButtonTitle>
                        <ButtonAccelerator>{platform.isDarwin ? 'Cmd+F' : 'Ctrl+F'}</ButtonAccelerator>
                    </Button>
                    <Button onClick={() => { this.setState({ isOpen: 'otherTools' }); }}>
                        <ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.otherTools.name}</ButtonTitle>
                        <ButtonAccelerator></ButtonAccelerator>
                        <MoreIcon isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                    </Button>
                    <Divider isVertical={false} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                    <Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://settings`, true); }}>
                        <img src={`${this.getIconDirectory()}/settings.png`} style={{ verticalAlign: 'middle' }} />
                        <ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.settings}</ButtonTitle>
                        <ButtonAccelerator></ButtonAccelerator>
                    </Button>
                    <Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://help`, true); }}>
                        <img src={`${this.getIconDirectory()}/help_outline.png`} style={{ verticalAlign: 'middle' }} />
                        <ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.help}</ButtonTitle>
                        <ButtonAccelerator></ButtonAccelerator>
                    </Button>
                    <Divider isVertical={false} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                    <Button>
                        <ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.close}</ButtonTitle>
                        <ButtonAccelerator>{platform.isDarwin ? 'Cmd+Q' : 'Alt+F4'}</ButtonAccelerator>
                    </Button>
                </Window>
                <Dialog isOpen={this.state.isOpen === 'userInfo'} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')}>
                    <DialogHeader>
                        <DialogHeaderButton src={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? DarkBackIcon : LightBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
                        <DialogHeaderTitle>{lang.window.toolBar.menu.menus.userInfo}</DialogHeaderTitle>
                    </DialogHeader>
                    <DialogContainer isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')}>
                    </DialogContainer>
                </Dialog>
                <Dialog isOpen={this.state.isOpen === 'app'} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')}>
                    <DialogHeader>
                        <DialogHeaderButton src={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? DarkBackIcon : LightBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
                        <DialogHeaderTitle>{lang.window.toolBar.menu.menus.app.name}</DialogHeaderTitle>
                    </DialogHeader>
                    <DialogContainer isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')}>
                        <Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://apps/`); }}>
                            <img src={`${this.getIconDirectory()}/apps.png`} style={{ verticalAlign: 'middle' }} />
                            <ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.app.list}</ButtonTitle>
                            <ButtonAccelerator></ButtonAccelerator>
                        </Button>
                        <Divider isVertical={false} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                        <Button onClick={() => { this.closeMenu(); ipcRenderer.send(`appWindow-add`, { url: this.state.url }); }}>
                            <ButtonTitle hasIcon={false}>{String(lang.window.toolBar.menu.menus.app.run).replace(/{title}/, lang.window.toolBar.menu.menus.app.name)}</ButtonTitle>
                            <ButtonAccelerator></ButtonAccelerator>
                        </Button>
                    </DialogContainer>
                </Dialog>
                <Dialog isOpen={this.state.isOpen === 'otherTools'} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')}>
                    <DialogHeader>
                        <DialogHeaderButton src={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private') ? DarkBackIcon : LightBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
                        <DialogHeaderTitle>{lang.window.toolBar.menu.menus.otherTools.name}</DialogHeaderTitle>
                    </DialogHeader>
                    <DialogContainer isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')}>
                        <Button onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-savePage-${this.props.windowId}`, { id: this.props.match.params.tabId }); }}>
                            <img src={`${this.getIconDirectory()}/save.png`} style={{ verticalAlign: 'middle' }} />
                            <ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.otherTools.savePage}</ButtonTitle>
                            <ButtonAccelerator>{platform.isDarwin ? 'Cmd+S' : 'Ctrl+S'}</ButtonAccelerator>
                        </Button>
                        <Divider isVertical={false} isDarkModeOrPrivateMode={userConfig.get('design.isDarkTheme') || String(this.props.windowId).startsWith('private')} />
                        <Button onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-viewSource-${this.props.windowId}`, { id: this.props.match.params.tabId }); }}>
                            <ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.otherTools.viewSource}</ButtonTitle>
                            <ButtonAccelerator>{platform.isDarwin ? 'Cmd+U' : 'Ctrl+U'}</ButtonAccelerator>
                        </Button>
                        <Button onClick={() => { this.closeMenu(); webView.isDevToolsOpened() ? webView.getDevToolsWebContents().focus() :  webView.openDevTools(); }}>
                            <ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.otherTools.devTool}</ButtonTitle>
                            <ButtonAccelerator>{platform.isDarwin ? 'Cmd+Shift+I' : 'Ctrl+Shift+I'}</ButtonAccelerator>
                        </Button>
                    </DialogContainer>
                </Dialog>
            </div>
        );
    }
}

export default MenuWindow;