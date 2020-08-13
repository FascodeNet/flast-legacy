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

const width = 320;
const height = 160;

module.exports = class InfomationView extends BrowserView {

    constructor(appWindow, windowId) {
        super({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        });

        this.appWindow = appWindow;
        this.windowId = windowId;

        const startUrl = process.env.ELECTRON_START_URL || format({
            pathname: path.join(__dirname, '/../../../build/index.html'), // 警告：このファイルを移動する場合ここの相対パスの指定に注意してください
            protocol: 'file:',
            slashes: true,
            hash: `/info/${windowId}`,
        });

        this.webContents.loadURL(startUrl);
    }

    showWindow = (title, description, url = '', isButton = false) => {
        this.appWindow.isModuleWindowFocused = true;

        this.appWindow.addBrowserView(this);

        this.fixBounds();
        this.webContents.focus();
        this.webContents.send(`infoWindow-${this.windowId}`, { title, description, url, isButton });

        ipcMain.once(`infoWindow-close-${this.windowId}`, (e, result) => {
            this.appWindow.removeBrowserView(this);
            this.hide();
            // this.appWindow.focus();
        });

        return new Promise((resolve, reject) => {
            ipcMain.once(`infoWindow-result-${this.windowId}`, (e, result) => {
                resolve(result);

                this.appWindow.removeBrowserView(this);
                this.hide();
                this.appWindow.focus();
            });
        });
    }

    hide = () => {
        this.setBounds({
            height: height,
            width: 1,
            x: 0,
            y: -height + 1,
        });

        this.appWindow.fixDragging();
    }

    fixBounds = () => {
        const bounds = this.appWindow.getContentBounds();
        this.setBounds({
            x: (userConfig.get('design.isHomeButton') ? (platform.isWin32 || platform.isDarwin ? (this.appWindow.isMaximized() ? 147 : 148) : 151) : (platform.isWin32 || platform.isDarwin ? (this.appWindow.isMaximized() ? 112 : 113) : 116)),
            y: this.appWindow.isFullScreen() ? bounds.y : 71,
            width: width,
            height: height
        });
    }
}