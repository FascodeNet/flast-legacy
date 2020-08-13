const { app, shell, ipcMain, protocol, session, BrowserWindow, BrowserView, Menu, nativeImage, clipboard, dialog, Notification } = require('electron');
const { join } = require('path');
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

module.exports = class OverlayWindow extends BrowserWindow {

    constructor(appWindow, windowId) {
        super({
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
        this.windowId = windowId;

        ipcMain.on(`overlayWindow-close-${this.id}`, (e, result) => {
            this.hide();
            this.appWindow.focus();
        });

        this.setParentWindow(appWindow);

        this.fixBounds();
    }

    showWindow = (path) => {
        this.appWindow.isModuleWindowFocused = true;

        const startUrl = process.env.ELECTRON_START_URL || format({
            pathname: join(__dirname, '/../../build/index.html'), // 警告：このファイルを移動する場合ここの相対パスの指定に注意してください
            protocol: 'file:',
            slashes: true,
            hash: path,
        });

        if (this.webContents.getURL() !== startUrl)
            this.loadURL(startUrl);

        this.fixBounds();
        this.show();

        this.focus();
    }

    hideWindow = () => {
        this.hide();
        this.fixBounds();

        this.appWindow.focus();
    }

    toggleWindow = (path) => {
        !this.isVisible() ? this.showWindow(path) : this.hideWindow();
    }

    fixBounds = () => {
        const bounds = this.appWindow.getContentBounds();
        this.setBounds({
            x: bounds.x,
            y: bounds.y,
            width: 500,
            height: 32
        });
    }
}