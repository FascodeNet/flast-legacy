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

module.exports = class PermissionWindow extends BrowserWindow {

    constructor(appWindow, windowId) {
        super({
            width: 320,
            height: 160,
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

        const startUrl = process.env.ELECTRON_START_URL || format({
            pathname: path.join(__dirname, '/../../build/index.html'), // 警告：このファイルを移動する場合ここの相対パスの指定に注意してください
            protocol: 'file:',
            slashes: true,
            hash: `/permission/${windowId}`,
        });

        this.loadURL(startUrl);
        this.setParentWindow(appWindow);

        // this.show();
        this.fixBounds();
    }

    showWindow = (permission, url) => {
        this.appWindow.isModuleWindowFocused = true;

        this.hide();
        this.webContents.send(`permissionWindow-${this.windowId}`, { permission, url });
        this.fixBounds();
        this.show();

        // this.webContents.openDevTools({ mode: 'detach' });

        ipcMain.once(`permissionWindow-close-${this.windowId}`, (e, result) => {
            this.hide();
            this.appWindow.focus();
        });

        return new Promise((resolve, reject) => {
            ipcMain.once(`permissionWindow-result-${this.windowId}`, (e, args) => {
                resolve({ result: args.result, isChecked: args.isChecked });
                this.hide();
                this.appWindow.focus();
            });
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