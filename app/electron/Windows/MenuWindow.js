const { app, shell, ipcMain, protocol, session, BrowserWindow, BrowserView, Menu, nativeImage, clipboard, dialog, Notification } = require('electron');
const path = require('path');
const { parse, format } = require('url');
const os = require('os');
const https = require('https');
const http = require('http');

const pkg = require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const { download } = require('electron-dl');
const platform = require('electron-platform');
const localShortcut = require('electron-localshortcut');

const Config = require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

const width = 350;
const height = 600;

module.exports = class MenuWindow extends BrowserWindow {

    constructor(appWindow) {
        super({
            width,
            height,
            frame: false,
            resizable: false,
            transparent: true,
            show: false,
            fullscreenable: false,
            skipTaskbar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            }
        });

        this.on('focus', () => {
            appWindow.isModuleWindowFocused = true;
        });
        this.on('blur', () => {
            appWindow.isModuleWindowFocused = false;
        });

        this.appWindow = appWindow;

        const startUrl = format({
            pathname: path.join(__dirname, '/../../build/index.html'),
            protocol: 'file:',
            slashes: true,
            hash: `/menu`,
        });

        this.loadURL(startUrl);
        this.setParentWindow(appWindow);

        // this.show();
        this.fixBounds();
    }

    showWindow = (tabId, url, zoomLevel, openUserInfo = false) => {
        this.appWindow.isModuleWindowFocused = true;

        this.hide();
        this.webContents.send(`menuWindow-${this.id}`, { windowId: this.appWindow.windowId, type: openUserInfo ? 'userInfo' : null, tabId, url, zoomLevel });
        this.fixBounds();
        this.show();

        // this.webContents.openDevTools({ mode: 'detach' });

        ipcMain.once(`menuWindow-close-${this.id}`, (e, result) => {
            if (this.isDestroyed()) return;
            this.hide();
            this.appWindow.focus();
        });
    }

    fixBounds = () => {
        const bounds = this.appWindow.getContentBounds();
        this.setBounds({
            x: this.appWindow.isMaximized() ? (bounds.x + bounds.width) - width : (bounds.x + bounds.width) - (width + 1),
            y: this.appWindow.isFullScreen() ? bounds.y : bounds.y + 70 + 1
        });
    }
}