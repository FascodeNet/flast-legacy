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

module.exports = class AuthenticationWindow extends BrowserWindow {
    
    constructor(appWindow) {
        super({
            width: 320,
            height: 220,
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

        const startUrl = process.env.ELECTRON_START_URL || format({
            pathname: path.join(__dirname, '/../../build/index.html'),
            protocol: 'file:',
            slashes: true,
            hash: `/authentication`,
        });

        this.loadURL(startUrl);
        this.setParentWindow(appWindow);

        // this.show();
        this.fixBounds();
    }

    isClosed = () => {
        return !this.isDestroyed();
    }

    showWindow = (loginCallback) => {
        if (this.isDestroyed()) return;
        this.appWindow.isModuleWindowFocused = true;

        this.hide();
        this.webContents.send(`authWindow-${this.id}`, { windowId: this.appWindow.windowId });
        this.fixBounds();
        this.show();

        ipcMain.once(`authWindow-close-${this.id}`, (e, result) => {
            this.hide();
            this.appWindow.focus();
        });

        ipcMain.once(`authWindow-result-${this.id}`, (e, arg) => {
            loginCallback(arg.user, arg.pass);
            if (!this.isDestroyed())
                this.hide();
            this.appWindow.focus();
        });

    }

    fixBounds = () => {
        const bounds = this.appWindow.getContentBounds();
        this.setBounds({
            x: bounds.x + (userConfig.get('design.isHomeButton') ? (platform.isWin32 || platform.isDarwin ? 148 : 151) : (platform.isWin32 || platform.isDarwin ? 113 : 116)),
            y: this.appWindow.isFullScreen() ? bounds.y : bounds.y + 70 + 1
        });
    }
}