const { app, shell, ipcMain, protocol, session, BrowserWindow, BrowserView, Menu, nativeImage, clipboard, dialog, Notification, nativeTheme } = require('electron');
const { join } = require('path');
const { parse, format } = require('url');
const { readFileSync } = require('fs-extra');
const os = require('os');
const https = require('https');
const http = require('http');

const InformationWindow = require('./InformationWindow');
const PermissionWindow = require('./PermissionWindow');
const MenuWindow = require('./MenuWindow');
const AuthenticationWindow = require('./AuthenticationWindow');
const SuggestWindow = require('./SuggestWindow');

const TranslateWindow = require('./TranslateWindow');

const { name, app_name } = JSON.parse(readFileSync(`${app.getAppPath()}/package.json`, 'utf8'));
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const { download } = require('electron-dl');
const fetch = require('node-fetch');
const platform = require('electron-platform');
const localShortcut = require('electron-localshortcut');
const isOnline = require('is-online');
const imageDataURI = require('image-data-uri');

const Config = require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const Data = require('../Data');

const { isURL, prefixHttp } = require('../URL');

const lang = require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);
const { runAdblockService, stopAdblockService } = require('../AdBlock');

module.exports = class MainWindow extends BrowserWindow {

    constructor(application, defaultConfig, isPrivate = false, data = new Data(), urls = (userConfig.get('startUp.isDefaultHomePage') ? [`${protocolStr}://home/`] : userConfig.get('startUp.defaultPages'))) {
        const { width, height, x, y } = userConfig.get('window.bounds');

        super({
            width: userConfig.get('window.isMaximized') ? 1110 : (width ?? 1110),
            height: userConfig.get('window.isMaximized') ? 680 : (height ?? 680),
            minWidth: 500,
            minHeight: 360,
            x,
            y,
            titleBarStyle: 'hiddenInset',
            frame: !userConfig.get('design.isCustomTitlebar'),
            fullscreenable: true,
            icon: nativeImage.createFromPath(`${__dirname}/static/app/icon.${platform.isWin32 ? 'ico' : 'png'}`),
            show: false,
            webPreferences: {
                nodeIntegration: true,
                webviewTag: true,
                plugins: true,
                experimentalFeatures: true,
                contextIsolation: false,
                enableRemoteModule: true
            }
        });

        this.application = application;
        this.data = data;

        this.views = [];

        this.isModuleWindowFocused = false;
        this.isFullScreenToolbar = false;
        this.isFloatingWindow = false;

        this.tabId = 0;

        this.isPrivate = isPrivate;
        this.windowId = (!isPrivate ? `window-${this.id}` : `private-${this.id}`);

        userConfig.get('window.isMaximized') && this.maximize();

        this.infoWindow = new InformationWindow(this);
        this.permissionWindow = new PermissionWindow(this, this.windowId);
        this.menuWindow = new MenuWindow(this);

        this.suggestWindow = new SuggestWindow(this, this.windowId);
        this.authenticationWindow = new AuthenticationWindow(this);

        this.translateWindow = new TranslateWindow(this, this.windowId);

        const mainMenu = this.getMainMenu(application, this);
        this.setMenu(mainMenu);
        if (platform.isDarwin)
            Menu.setApplicationMenu(mainMenu);

        // this.setMenuBarVisibility(false);
        // this.autoHideMenuBar = true;

        let urlStrings = '';
        urls.map((url, i) => urlStrings += `${encodeURIComponent(url)}($|$)`);

        const startUrl = process.env.ELECTRON_START_URL || format({
            pathname: join(__dirname, '/../../build/index.html'),
            protocol: 'file:',
            slashes: true,
            hash: `/window/${this.windowId}/${urlStrings.substring(0, urlStrings.length - 5)}`,
        });

        this.loadURL(startUrl);

        this.once('ready-to-show', () => this.show());

        this.on('closed', () => {
            application.currentWindow = null;
            this.views.map((item) => item.view.webContents.destroy());
        });
        this.on('close', (e) => {
            userConfig.set('window.isMaximized', this.isMaximized());
            userConfig.set('window.bounds', this.getBounds());
        });

        this.on('focus', () => {
            if (!isPrivate)
                application.currentWindow = this;

            this.webContents.send(`window-focus-${this.windowId}`, {});

            this.infoWindow.fixBounds();
            this.permissionWindow.fixBounds();
            this.menuWindow.fixBounds();
            this.suggestWindow.fixBounds();
            this.authenticationWindow.fixBounds();

            this.infoWindow.hide();
            this.menuWindow.hide();
            this.suggestWindow.hide();
            this.translateWindow.hide();
        });
        this.on('blur', () => {
            if (this.isModuleWindowFocused) return;

            this.webContents.send(`window-blur-${this.windowId}`, {});
        });

        // this.on('resize', this.resizeWindows);
        // this.on('move', this.resizeWindows);

        this.on('maximize', () => {
            this.resizeWindows();

            this.webContents.send(`window-maximized-${this.windowId}`, {});
        });
        this.on('unmaximize', () => {
            this.resizeWindows();

            this.webContents.send(`window-unmaximized-${this.windowId}`, {});
        });

        this.on('restore', this.resizeWindows);
        this.on('enter-full-screen', this.resizeWindows);
        this.on('leave-full-screen', this.resizeWindows);
        this.on('enter-html-full-screen', this.resizeWindows);
        this.on('leave-html-full-screen', this.resizeWindows);

        this.registerListeners(this.windowId);
    }

    hideWindows = () => {
        this.infoWindow.hide();
        this.permissionWindow.hide();
        this.menuWindow.hide();
        this.suggestWindow.hide();
        this.authenticationWindow.hide();

        this.translateWindow.hide();

        this.fixBounds();
    }

    resizeWindows = () => {
        this.fixBounds();

        this.infoWindow.fixBounds();
        this.permissionWindow.fixBounds();
        this.menuWindow.fixBounds();
        this.suggestWindow.fixBounds();
        this.authenticationWindow.fixBounds();

        this.translateWindow.fixBounds();
    };

    getWindowId = () => {
        return this.windowId;
    }

    getFloatingWindow = () => {
        return this.isFloatingWindow;
    }

    registerListeners = (id) => {

        ipcMain.on(`window-adBlock-${id}`, (e, args) => {
            // this.infoWindow.showWindow('test', 'test', false);
        });


        ipcMain.on(`window-titleBarWindow-${id}`, (e, args) => {

        });

        ipcMain.on(`view-focus-${this.id}`, (e, args) => {
            this.hideWindows();
            this.resizeWindows();
        });


        ipcMain.on(`window-isFullScreen-toolBar-${id}`, (e, args) => {
            e.sender.send(`window-isFullScreen-toolBar-${id}`, { result: this.isFullScreenToolbar });
        });

        ipcMain.on(`window-fullScreen-toolBar-${id}`, (e, args) => {
            this.isFullScreenToolbar = !this.isFullScreenToolbar;
            e.sender.send(`window-fullScreen-toolBar-${id}`, { result: this.isFullScreenToolbar });
        });

        ipcMain.on(`window-isFullScreen-${id}`, (e, args) => {
            e.sender.send(`window-isFullScreen-${id}`, { result: this.isFullScreen() });
        });

        ipcMain.on(`window-fullScreen-${id}`, (e, args) => {
            this.isFullScreenToolbar = false;
            this.setFullScreen(!this.isFullScreen());
            this.fixBounds();
            e.sender.send(`window-fullScreen-${id}`, { result: this.isFullScreen() });
        });

        ipcMain.on(`window-infoWindow-${id}`, (e, args) => {
            this.infoWindow.hide();
            this.menuWindow.hide();
            this.suggestWindow.hide();
            this.infoWindow.showWindow(args.title, args.description, args.url, args.certificate, args.isButton);
        });

        ipcMain.on(`window-translateWindow-${id}`, (e, args) => {
            this.hideWindows();

            !this.translateWindow.isVisible() ? this.translateWindow.showWindow(args.url) : this.translateWindow.hide();
        });

        ipcMain.on(`window-menuWindow-${id}`, (e, args) => {
            this.hideWindows();

            if (!this.menuWindow.isVisible()) {
                const item = this.findView(args.id);
                if (this.isNullOrUndefined(item)) return;

                let webContents = item.view.webContents;

                this.menuWindow.showWindow(args.id, args.url, webContents.zoomFactor, args.openUserInfo);
            } else {
                this.menuWindow.hide();
            }
        });

        ipcMain.on(`window-showSuggest-${id}`, (e, args) => {
            this.infoWindow.hide();
            this.permissionWindow.hide();
            this.menuWindow.hide();
            this.authenticationWindow.hide();
            this.suggestWindow.showWindow(args.id, args.text);
        });

        ipcMain.on(`window-hideSuggest-${id}`, (e, args) => {
            this.suggestWindow.hide();
        });

        ipcMain.on(`tab-add-${id}`, (e, args) => {
            this.addView(args.url, args.isActive);
        });

        ipcMain.on(`tab-remove-${id}`, (e, args) => {
            this.removeView(args.id);
        });

        ipcMain.on(`tab-select-${id}`, (e, args) => {
            this.selectView(args.id);
        });

        ipcMain.on(`tab-get-${id}`, (e, args) => {
            args.id != null ? this.getView(args.id) : this.getViews();
        });

        ipcMain.on(`tab-fixed-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            const index = this.findViewIndex(args.id);

            let newViews = this.views.concat();
            newViews[index].isFixed = args.result;
            this.views = newViews;

            this.getViews(this.windowId);
        });

        ipcMain.on(`browserView-goBack-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            if (webContents.canGoBack())
                webContents.goBack();

            const url = webContents.getURL();
            if (url.startsWith(`${protocolStr}://error`)) {
                if (webContents.canGoBack())
                    webContents.goBack();
            }
        });

        ipcMain.on(`browserView-goForward-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            if (webContents.canGoForward())
                webContents.goForward();

            const url = webContents.getURL();
            if (url.startsWith(`${protocolStr}://error`)) {
                if (webContents.canGoForward())
                    webContents.goForward();
            }
        });

        ipcMain.on(`browserView-reload-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            webContents.reload();
        });

        ipcMain.on(`browserView-stop-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            webContents.stop();
        });

        ipcMain.on(`browserView-goHome-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            webContents.loadURL(userConfig.get('homePage.homeButton.isDefaultHomePage') ? `${protocolStr}://home/` : userConfig.get('homePage.homeButton.defaultPage'));
        });

        ipcMain.on(`browserView-loadURL-${id}`, (e, args) => {
            const url = String(args.url);
            const pattern = /^(file:\/\/\S.*)\S*$/;

            this.infoWindow.hide();
            this.suggestWindow.hide();

            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            !pattern.test(url) ? webContents.loadURL(url) : webContents.loadFile(url.replace(/^(file:\/\/\/?)/, ''));
        });

        ipcMain.on(`browserView-loadFile-${id}`, (e, args) => {
            this.infoWindow.hide();
            this.suggestWindow.hide();

            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;
            webContents.loadFile(args.url);
        });

        ipcMain.on(`browserView-zoom-${id}`, (e, args) => {
            this.getZoom(args.id);
        });

        ipcMain.on(`browserView-zoomIn-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            if (webContents.zoomFactor > 4.9) return;

            webContents.zoomFactor = webContents.zoomFactor + 0.1;
            this.getZoom(args.id);
            this.webContents.send(`menuWindow-${this.windowId}`, { url: webContents.getURL(), zoomLevel: webContents.zoomFactor });
        });

        ipcMain.on(`browserView-zoomOut-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            if (webContents.zoomFactor < 0.2) return;

            webContents.zoomFactor = webContents.zoomFactor - 0.1;
            this.getZoom(args.id);
            this.webContents.send(`menuWindow-${this.windowId}`, { url: webContents.getURL(), zoomLevel: webContents.zoomFactor });
        });

        ipcMain.on(`browserView-zoomDefault-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            webContents.zoomFactor = userConfig.get('pageSettings.contents.zoomLevel', 1);
            this.getZoom(args.id);
            this.webContents.send(`menuWindow-${this.windowId}`, { url: webContents.getURL(), zoomLevel: webContents.zoomFactor });
        });

        ipcMain.on(`browserView-audioMute-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            webContents.audioMuted = !webContents.audioMuted;
            this.getViews();
        });

        ipcMain.on(`browserView-print-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;
            webContents.print();
        });

        ipcMain.on(`browserView-savePage-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            dialog.showSaveDialog({
                defaultPath: `${app.getPath('downloads')}/${webContents.getTitle()}.html`,
                filters: [
                    { name: 'HTML', extensions: ['htm', 'html'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            }, (fileName) => {
                if (this.isNullOrUndefined(fileName)) return;
                webContents.savePage(fileName, 'HTMLComplete', (err) => {
                    if (!err) console.log('Page Save successfully');
                });
            });
        });

        ipcMain.on(`browserView-viewSource-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;
            this.addView(`view-source:${webContents.getURL()}`, true);
        });

        ipcMain.on(`browserView-devTool-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;

            webContents.isDevToolsOpened() ? webContents.devToolsWebContents.focus() : webContents.openDevTools();
        });

        ipcMain.on(`suggestWindow-loadURL-${id}`, (e, args) => {
            this.infoWindow.hide();
            this.suggestWindow.hide();

            this.focus();

            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;
            webContents.loadURL(args.url);
        });

        ipcMain.on(`suggestWindow-loadFile-${id}`, (e, args) => {
            this.infoWindow.hide();
            this.suggestWindow.hide();

            this.focus();

            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            let webContents = item.view.webContents;
            webContents.loadFile(args.url);
        });

        ipcMain.on(`data-bookmark-add-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            const view = item.view;
            this.data.updateBookmark(view.webContents.getTitle(), view.webContents.getURL(), null, args.isFolder, args.isPrivate);
            this.updateViewState(view);
        });

        ipcMain.on(`data-bookmark-remove-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            const view = item.view;
            this.data.removeBookmark(view.webContents.getURL(), args.isPrivate);
            this.updateViewState(view);
        });

        ipcMain.on(`data-bookmark-has-${id}`, (e, args) => {
            const item = this.findView(args.id);
            if (this.isNullOrUndefined(item)) return;

            const view = item.view;
            e.sender.send(`data-bookmark-has-${id}`, { isBookmarked: this.data.hasBookmark(view.webContents.getURL(), args.isPrivate) });
        });
    }

    fixDragging = () => {
        const bounds = this.getBounds();
        this.setBounds({ height: bounds.height + 1 });
        this.setBounds(bounds);
    }

    fixBounds = () => {
        const view = this.getBrowserViews()[0];
        if (this.isNullOrUndefined(view)) return;

        const { width, height } = this.getContentBounds();

        view.setAutoResize({ width: true, height: true });
        if (this.isFloatingWindow) {
            this.minimizable = false;
            this.maximizable = false;
            this.setAlwaysOnTop(true);
            this.visibleOnAllWorkspaces = true;
            this.setVisibleOnAllWorkspaces(true);

            view.setBounds({
                x: 1,
                y: 1,
                width: width - 2,
                height: height - 2,
            });
        } else {
            this.minimizable = true;
            this.maximizable = true;
            this.setAlwaysOnTop(false);
            this.visibleOnAllWorkspaces = false;
            this.setVisibleOnAllWorkspaces(false);

            if (this.isFullScreen()) {
                const toolBarHeight = 40;

                view.setBounds({
                    x: 0,
                    y: platform.isDarwin ? this.getHeight(true, height) : (this.isFullScreenToolbar ? toolBarHeight : 0),
                    width: width,
                    height: platform.isDarwin ? this.getHeight(false, height) : (this.isFullScreenToolbar ? height - toolBarHeight : height),
                });
            } else {
                view.setBounds({
                    x: !this.isMaximized() && userConfig.get('design.isCustomTitlebar') && !platform.isDarwin ? 1 : 0,
                    y: this.isMaximized() ? this.getHeight(true, height) : userConfig.get('design.isCustomTitlebar') && !platform.isDarwin ? this.getHeight(true, height) + 1 : this.getHeight(true, height),
                    width: !this.isMaximized() && userConfig.get('design.isCustomTitlebar') && !platform.isDarwin ? width - 2 : width,
                    height: this.isMaximized() ? this.getHeight(false, height) : (userConfig.get('design.isCustomTitlebar') && !platform.isDarwin ? (this.getHeight(false, height)) - 2 : this.getHeight(false, height)),
                });
            }
        }
        view.setAutoResize({ width: true, height: true });
    }

    getHeight = (b, height) => {
        const view = this.getBrowserViews()[0];
        if (this.isNullOrUndefined(view)) return;

        const titleBarHeight = 37;
        const toolBarHeight = 40;

        const baseBarHeight = titleBarHeight + toolBarHeight;
        const bookMarkBarHeight = 32;

        const isBookmarkBar = userConfig.get('design.isBookmarkBar') === 1 || (userConfig.get('design.isBookmarkBar') === 0 && view.webContents.getURL().startsWith(`${protocolStr}://home/`));

        return b ? (isBookmarkBar ? (baseBarHeight + bookMarkBarHeight) : baseBarHeight) : (height - (isBookmarkBar ? (baseBarHeight + bookMarkBarHeight) : baseBarHeight));
    }

    getDomain = (url) => {
        let hostname = url;

        if (hostname.indexOf('http://') !== -1 || hostname.indexOf('https://') !== -1)
            hostname = hostname.split('://')[1];
        if (hostname.indexOf('?') !== -1)
            hostname = hostname.split('?')[0];

        hostname = hostname.indexOf('://') !== -1 ? `${hostname.split('://')[0]}://${hostname.split('/')[2]}` : hostname.split('/')[0];

        return hostname;
    }

    getCertificate = (url) => {
        return new Promise((resolve, reject) => {
            if (url.startsWith(`${protocolStr}://`) || url.startsWith(`${fileProtocolStr}://`)) {
                return resolve({ type: url.startsWith(`${protocolStr}://home`) ? 'Search' : 'Internal' });
            } else if (url.startsWith('view-source:')) {
                return resolve({ type: 'Source' });
            } else if (url.startsWith('file://')) {
                return resolve({ type: 'File' });
            } else if (url.startsWith('https://')) {
                const domain = this.getDomain(url);

                let options = {
                    host: domain,
                    port: 443,
                    method: 'GET'
                };

                let req = https.request(options, (res) => {
                    let certificate = res.connection.getPeerCertificate();
                    if (this.isNullOrUndefined(certificate.subject)) return;

                    console.log(certificate);

                    resolve({ type: 'Secure', certificate });
                });

                req.end();
            } else if (url.startsWith('http://')) {
                return resolve({ type: 'InSecure' });
            }
        });
    }

    findView = (id) => this.views.filter(item => !this.isNullOrUndefined(item.view.webContents)).find(item => item.view.webContents.id === id);
    findViewIndex = (id) => this.views.filter(item => !this.isNullOrUndefined(item.view.webContents)).findIndex(item => item.view.webContents.id === id);

    addView = (url = userConfig.get('homePage.newTab.defaultPage'), isActive = true) => {
        this.addTab(url, isActive);
    }

    removeView = (id = this.tabId) => {
        const item = this.findView(id);
        if (this.isNullOrUndefined(item)) return;

        const index = this.findViewIndex(id);

        if (index + 1 < this.views.length) {
            this.__selectView(index + 1);
        } else if (index - 1 >= 0) {
            this.__selectView(index - 1);
        }

        item.view.webContents.destroy();
        this.views.splice(index, 1);
    }

    selectView = (id) => {
        const item = this.findView(id);
        if (this.isNullOrUndefined(item)) return;

        this.tabId = id;

        this.setBrowserView(item.view);
        this.setTitle(`${item.view.webContents.getTitle()} - ${app_name}`);
        this.updateState(item.view);

        this.webContents.send(`tab-select-${this.windowId}`, { id });

        this.fixBounds();
    }

    __selectView = (i) => {
        const item = this.views[i];
        if (this.isNullOrUndefined(item) || this.isNullOrUndefined(item.view) || this.isNullOrUndefined(item.view.webContents)) return;

        this.tabId = item.id;

        this.setBrowserView(item.view);
        this.setTitle(`${item.view.webContents.getTitle()} - ${app_name}`);

        this.updateNavigationState(item.view);
        this.updateViewState(item.view);

        this.webContents.send(`tab-select-${this.windowId}`, { id: item.id });

        this.infoWindow.hide();
        this.permissionWindow.hide();
        this.menuWindow.hide();
        this.suggestWindow.hide();
        this.authenticationWindow.hide();

        this.fixBounds();
    }

    getView = (id) => {
        const item = this.findView(id);
        if (this.isNullOrUndefined(item)) return;

        const url = item.view.webContents.getURL();

        const title = item.view.webContents.getTitle();
        const color = userConfig.get('design.tabAccentColor');
        const isAudioStatus = !item.view.webContents.audioMuted ? (item.view.webContents.isCurrentlyAudible() ? 1 : 0) : -1;
        const isFixed = item.isFixed;
        const isBookmarked = false;

        // this.webContents.send(`tab-get-${this.windowId}`, { id, view: { id, title, url, icon: undefined, color, isAudioStatus, isFixed, isBookmarked } });
        this.webContents.send(`tab-get-${this.windowId}`, { id, view: { id, title, url, icon: this.data.getFavicon(url), color, isAudioStatus, isFixed, isBookmarked } });
    }

    getViews = () => {
        const color = userConfig.get('design.tabAccentColor');
        const isBookmarked = false;

        let datas = [];

        this.views.filter((item) => !this.isNullOrUndefined(item.view.webContents)).map((item) => {
            const id = item.view.webContents.id;
            const title = item.view.webContents.getTitle();
            const url = item.view.webContents.getURL();
            const isAudioStatus = !item.view.webContents.audioMuted ? (item.view.webContents.isCurrentlyAudible() ? 1 : 0) : -1;
            const isFixed = item.isFixed;

            datas.push({ id, title, url, icon: undefined, color, isAudioStatus, isFixed, isBookmarked });
        });

        this.webContents.send(`tab-get-${this.windowId}`, { views: datas });


        this.views.filter((item) => !this.isNullOrUndefined(item.view.webContents)).map((item) => {
            const id = item.view.webContents.id;
            const title = item.view.webContents.getTitle();
            const url = item.view.webContents.getURL();
            const isAudioStatus = !item.view.webContents.audioMuted ? (item.view.webContents.isCurrentlyAudible() ? 1 : 0) : -1;
            const isFixed = item.isFixed;

            const view = { id, title, url, icon: this.data.getFavicon(url), color, isAudioStatus, isFixed, isBookmarked };
            this.webContents.send(`tab-get-${this.windowId}`, { id, view });
        });
    }

    addTab = (url = userConfig.get('homePage.newTab.defaultPage'), isActive = true) => {
        const partition = !String(this.windowId).startsWith('private') ? `persist:${config.get('currentUser')}` : config.get('currentUser');
        this.loadSessionAndProtocol(partition, String(this.windowId).startsWith('private'));

        const view = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
                enableRemoteModule: true,
                plugins: true,
                experimentalFeatures: true,
                safeDialogs: true,
                safeDialogsMessage: '今後このページではダイアログを表示しない',
                partition: partition,
                preload: require.resolve('../Preloads/Preload')
            }
        });

        view.setAutoResize({ width: true, height: true });
        view.webContents.setVisualZoomLevelLimits(1, 3);

        const id = view.webContents.id;
        this.tabId = id;

        let viewId = '';

        userConfig.get('adBlock.isEnabled') ? runAdblockService(partition) : stopAdblockService(partition);

        view.webContents.on('did-start-loading', () => {
            if (view.webContents.isDestroyed()) return;

            this.webContents.send(`browserView-start-loading-${this.windowId}`, { id });

            const isBookmarkBar = userConfig.get('design.isBookmarkBar') === 1 || (userConfig.get('design.isBookmarkBar') === 0 && url.startsWith(`${protocolStr}://home/`));
            if (isBookmarkBar) {
                this.fixBounds();

                const bookmarks = this.data.datas.bookmarks
                    .filter((item, i) => item.isPrivate === String(this.windowId).startsWith('private'))
                    .sort((a, b) => {
                        if (a.updatedAt > b.updatedAt) return -1;
                        if (a.updatedAt < b.updatedAt) return 1;
                        return 0;
                    });
                this.webContents.send('window-bookmarks-get', { bookmarks })
            }
        });
        view.webContents.on('did-stop-loading', () => {
            if (view.webContents.isDestroyed()) return;

            this.webContents.send(`browserView-stop-loading-${this.windowId}`, { id });
            this.updateState(view);

            const isBookmarkBar = userConfig.get('design.isBookmarkBar') === 1 || (userConfig.get('design.isBookmarkBar') === 0 && url.startsWith(`${protocolStr}://home/`));
            isBookmarkBar && this.fixBounds();
        });

        view.webContents.on('did-start-navigation', async (e, url, isInPlace, isMainFrame, processId, routingId) => {
            if (view.webContents.isDestroyed()) return;

            if (isMainFrame) {
                this.infoWindow.hide();
                this.suggestWindow.hide();

                if (url.startsWith('https://twitter.com') && !userConfig.get('pageSettings.pages.twitter.oldDesignIgnore')) {
                    const b = userConfig.get('pageSettings.pages.twitter.oldDesign');
                    const result = await this.infoWindow.showWindow('Twitter', 'Twitter の旧デザインが利用できます。\n今すぐ変更しますか？', 'https://twitter.com/', undefined, true);
                    userConfig.set('pageSettings.pages.twitter.oldDesign', result);
                    userConfig.set('pageSettings.pages.twitter.oldDesignIgnore', true);

                    if (result != b) {
                        view.webContents.session.clearStorageData({
                            origin: 'https://twitter.com',
                            storages: [
                                'appcache',
                                'cachestorage',
                            ],
                        });
                        view.webContents.reloadIgnoringCache();
                    }
                } else {
                    this.infoWindow.hide();
                }
            }
        });

        const filter = {
            urls: ['https://twitter.com/*']
        }
        view.webContents.session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
            if (!userConfig.get('pageSettings.pages.twitter.oldDesign')) return callback(details);

            details.requestHeaders['User-Agent'] = 'Internet Explorer 11 (Mozilla/5.0 (Windows NT 9.0; WOW64; Trident/7.0; rv:11.0) like Gecko)';
            return callback({ requestHeaders: details.requestHeaders });
        });

        view.webContents.on('did-finish-load', (e) => {
            if (view.webContents.isDestroyed()) return;

            viewId = this.getRandString(12);

            this.setTitle(`${view.webContents.getTitle()} - ${app_name}`);
            this.updateState(view);

            this.getCertificate(view.webContents.getURL()).then((certificate) => this.webContents.send(`browserView-certificate-${this.windowId}`, { id, certificate }));

            this.getZoom(id);
        });
        view.webContents.on('did-fail-load', (e, code, description, url, isMainFrame, processId, routingId) => {
            if (view.webContents.isDestroyed() || !isMainFrame || code === -3) return;

            view.webContents.loadURL(`${protocolStr}://error/#${description}/${encodeURIComponent(url)}`);
        });

        view.webContents.on('page-title-updated', (e, title) => {
            if (view.webContents.isDestroyed()) return;

            if (!String(this.windowId).startsWith('private') && !(view.webContents.getURL().startsWith(`${protocolStr}://`) || view.webContents.getURL().startsWith(`${fileProtocolStr}://`)))
                this.data.updateHistory(title, view.webContents.getURL());

            this.setTitle(`${title} - ${app_name}`);

            this.getZoom(id);
        });
        view.webContents.on('page-favicon-updated', (e, favicons) => {
            if (view.webContents.isDestroyed()) return;

            if (!(view.webContents.getURL().startsWith(`${protocolStr}://`) || view.webContents.getURL().startsWith(`${fileProtocolStr}://`))) {
                imageDataURI.encodeFromURL(favicons[0]).then((favicon) => {
                    this.data.updateFavicon(view.webContents.getURL(), favicon);
                    this.data.updateHistory(view.webContents.getTitle(), view.webContents.getURL());
                });
            }

            this.setTitle(`${view.webContents.getTitle()} - ${app_name}`);

            this.getZoom(id);
        });
        view.webContents.on('did-change-theme-color', (e, color) => {
            if (view.webContents.isDestroyed()) return;

            this.setTitle(`${view.webContents.getTitle()} - ${app_name}`);

            this.getZoom(id);

            this.webContents.send(`browserView-theme-color-${this.windowId}`, { id: view.webContents.id, color });
        });

        view.webContents.on('media-started-playing', (e) => {
            this.updateState(view);

            this.getZoom(id);
        });
        view.webContents.on('media-paused', (e) => {
            this.updateState(view);

            this.getZoom(id);
        });

        view.webContents.on('update-target-url', (e, url) => {
            /*
            if (url.length > 0) {
                view.webContents.executeJavaScript(
                    `(function () {
                        let dom = document.getElementById('tip-${executeJs}');
                        
                        document.getElementById('tip-${executeJs}').style.display = 'block';
                        dom.textContent = '${url}';
                    })()`
                );
            } else {
                view.webContents.executeJavaScript(
                    `(function () {
                        document.getElementById('tip-${executeJs}').style.display = 'none';
                    })()`
                );
            }
            */
        })

        view.webContents.on('new-window', (e, url, frameName, disposition, options) => {
            if (view.webContents.isDestroyed()) return;

            if (disposition === 'new-window') {
                if (frameName === '_self') {
                    e.preventDefault();
                    view.webContents.loadURL(url);
                } else {
                    e.preventDefault();
                    this.addView(url, true);
                }
            } else if (disposition === 'foreground-tab') {
                e.preventDefault();
                this.addView(url, true);
            } else if (disposition === 'background-tab') {
                e.preventDefault();
                this.addView(url, false);
            }
        });

        view.webContents.on('certificate-error', (e, url, error, certificate, callback) => {
            e.preventDefault();
            if (Notification.isSupported()) {
                const notify = new Notification({
                    icon: join(app.getAppPath(), 'static', 'app', 'icon.png'),
                    title: `プライバシー エラー`,
                    body: '詳細はここをクリックしてください。',
                    silent: true
                });

                notify.show();

                notify.on('click', (e) => {
                    dialog.showMessageBox({
                        type: 'warning',
                        title: 'プライバシー エラー',
                        message: 'この接続ではプライバシーが保護されません',
                        detail: `${parse(url).hostname} の証明書を信頼することができませんでした。\n信頼できるページに戻ることをおすすめします。\nこのまま閲覧することも可能ですが安全ではありません。`,
                        noLink: true,
                        buttons: ['続行', 'キャンセル'],
                        defaultId: 1,
                        cancelId: 1
                    }, (res) => {
                        callback(res === 0);
                    });
                });
                notify.on('close', (e) => {
                    callback(false);
                });
            } else {
                dialog.showMessageBox({
                    type: 'warning',
                    title: 'プライバシー エラー',
                    message: 'この接続ではプライバシーが保護されません',
                    detail: `${parse(url).hostname} の証明書を信頼することができませんでした。\n信頼できるページに戻ることをおすすめします。\nこのまま閲覧することも可能ですが安全ではありません。`,
                    noLink: true,
                    buttons: ['続行', 'キャンセル'],
                    defaultId: 1,
                    cancelId: 1
                }, (res) => {
                    callback(res === 0);
                });
            }
        });

        view.webContents.on('login', (e, request, authInfo, callback) => {
            e.preventDefault();

            if (!this.authenticationWindow.isClosed())
                this.authenticationWindow = new AuthenticationWindow(this, this.windowId);
            this.authenticationWindow.showWindow(callback);
        });

        view.webContents.on('context-menu', (e, params) => {
            if (view.webContents.isDestroyed()) return;

            let menu;
            if (params.linkURL !== '' && !params.hasImageContents) {
                menu = Menu.buildFromTemplate(
                    [
                        {
                            label: lang.window.view.contextMenu.link.newTab,
                            click: () => { this.addView(params.linkURL, false); }
                        },
                        {
                            label: lang.window.view.contextMenu.link.newWindow,
                            click: () => { this.application.addWindow(false, [params.linkURL]); }
                        },
                        {
                            label: lang.window.view.contextMenu.link.openPrivateWindow,
                            click: () => { this.application.addWindow(true, [params.linkURL]); }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.link.copy,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/copy.png`,
                            accelerator: 'CmdOrCtrl+C',
                            click: () => {
                                clipboard.clear();
                                clipboard.writeText(params.linkURL);
                            }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.devTool,
                            accelerator: 'CmdOrCtrl+Shift+I',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                view.webContents.isDevToolsOpened() ? view.webContents.devToolsWebContents.focus() : view.webContents.openDevTools();
                            }
                        }
                    ]
                );
            } else if (params.linkURL === '' && params.hasImageContents) {
                menu = Menu.buildFromTemplate(
                    [
                        {
                            label: lang.window.view.contextMenu.image.newTab,
                            click: () => {
                                this.addView(params.srcURL, false);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.saveImage,
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                view.webContents.downloadURL(params.srcURL);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.copyImage,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/copy.png`,
                            click: () => {
                                const img = nativeImage.createFromDataURL(params.srcURL);

                                clipboard.clear();
                                clipboard.writeImage(img);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.copyLink,
                            click: () => {
                                clipboard.clear();
                                clipboard.writeText(params.srcURL);
                            }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.devTool,
                            accelerator: 'CmdOrCtrl+Shift+I',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                view.webContents.isDevToolsOpened() ? view.webContents.devToolsWebContents.focus() : view.webContents.openDevTools();
                            }
                        }
                    ]
                );
            } else if (params.linkURL !== '' && params.hasImageContents) {
                menu = Menu.buildFromTemplate(
                    [
                        {
                            label: lang.window.view.contextMenu.link.newTab,
                            click: () => { this.addView(params.linkURL, false); }
                        },
                        {
                            label: lang.window.view.contextMenu.link.newWindow,
                            click: () => { this.application.addWindow(false, [params.linkURL]); }
                        },
                        {
                            label: lang.window.view.contextMenu.link.openPrivateWindow,
                            click: () => { this.application.addWindow(true, [params.linkURL]); }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.link.copy,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/copy.png`,
                            accelerator: 'CmdOrCtrl+C',
                            click: () => {
                                clipboard.clear();
                                clipboard.writeText(params.linkURL);
                            }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.image.newTab,
                            click: () => {
                                this.addView(params.srcURL, false);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.saveImage,
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                view.webContents.downloadURL(params.srcURL);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.copyImage,
                            click: () => {
                                const img = nativeImage.createFromDataURL(params.srcURL);

                                clipboard.clear();
                                clipboard.writeImage(img);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.copyLink,
                            click: () => {
                                clipboard.clear();
                                clipboard.writeText(params.srcURL);
                            }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.devTool,
                            accelerator: 'CmdOrCtrl+Shift+I',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                view.webContents.isDevToolsOpened() ? view.webContents.devToolsWebContents.focus() : view.webContents.openDevTools();
                            }
                        }
                    ]
                );
            } else if (params.isEditable) {
                menu = Menu.buildFromTemplate(
                    [
                        ...(app.isEmojiPanelSupported() ? [{
                            label: lang.window.view.contextMenu.editable.emotePalette,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/emote.png`,
                            click: () => { app.showEmojiPanel(); }
                        },
                        { type: 'separator' }
                        ] : []),
                        {
                            label: lang.window.view.contextMenu.editable.undo,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/undo.png`,
                            accelerator: 'CmdOrCtrl+Z',
                            enabled: params.editFlags.canUndo,
                            role: 'undo'
                        },
                        {
                            label: lang.window.view.contextMenu.editable.redo,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/redo.png`,
                            accelerator: 'CmdOrCtrl+Y',
                            enabled: params.editFlags.canRedo,
                            role: 'redo'
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.editable.cut,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/cut.png`,
                            accelerator: 'CmdOrCtrl+X',
                            enabled: params.editFlags.canCopy,
                            role: 'cut'
                        },
                        {
                            label: lang.window.view.contextMenu.editable.copy,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/copy.png`,
                            accelerator: 'CmdOrCtrl+C',
                            enabled: params.editFlags.canCopy,
                            role: 'copy'
                        },
                        {
                            label: lang.window.view.contextMenu.editable.paste,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/paste.png`,
                            accelerator: 'CmdOrCtrl+V',
                            enabled: params.editFlags.canPaste,
                            role: 'paste'
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.editable.selectAll,
                            accelerator: 'CmdOrCtrl+A',
                            enabled: params.editFlags.canSelectAll,
                            role: 'selectAll'
                        },
                        ...(params.editFlags.canCopy ? [
                            { type: 'separator' },
                            {
                                label: String(lang.window.view.contextMenu.selection.textSearch).replace(/{name}/, this.getSearchEngine().name).replace(/{text}/, params.selectionText.replace(/([\n\t])+/g, ' ')),
                                visible: params.editFlags.canCopy && !isURL(params.selectionText.replace(/([\n\t])+/g, ' ')),
                                click: () => {
                                    this.addView(this.getSearchEngine().url.replace('%s', encodeURIComponent(params.selectionText.replace(/([\n\t])+/g, ' '))), true);
                                }
                            },
                            {
                                label: String(lang.window.view.contextMenu.selection.textLoad).replace(/{text}/, params.selectionText.replace(/([\n\t])+/g, '')),
                                visible: params.editFlags.canCopy && isURL(params.selectionText.replace(/([\n\t])+/g, '')),
                                click: () => {
                                    this.addView(params.selectionText.replace(/([\n\t])+/g, ''), true);
                                }
                            }
                        ] : []),
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.devTool,
                            accelerator: 'CmdOrCtrl+Shift+I',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                view.webContents.isDevToolsOpened() ? view.webContents.devToolsWebContents.focus() : view.webContents.openDevTools();
                            }
                        }
                    ]
                );
            } else if (params.selectionText !== '' && !params.isEditable) {
                menu = Menu.buildFromTemplate(
                    [{
                        label: lang.window.view.contextMenu.selection.copy,
                        icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/copy.png`,
                        accelerator: 'CmdOrCtrl+C',
                        enabled: params.editFlags.canCopy,
                        role: 'copy'
                    },
                    {
                        label: String(lang.window.view.contextMenu.selection.textSearch).replace(/{name}/, this.getSearchEngine().name).replace(/{text}/, params.selectionText.replace(/([\n\t])+/g, ' ')),
                        visible: !isURL(params.selectionText.replace(/([\n\t])+/g, ' ')),
                        click: () => {
                            this.addView(this.getSearchEngine().url.replace('%s', encodeURIComponent(params.selectionText.replace(/([\n\t])+/g, ' '))), true);
                        }
                    },
                    {
                        label: String(lang.window.view.contextMenu.selection.textLoad).replace(/{text}/, params.selectionText.replace(/([\n\t])+/g, '')),
                        visible: isURL(params.selectionText.replace(/([\n\t])+/g, '')),
                        click: () => {
                            this.addView(params.selectionText.replace(/([\n\t])+/g, ''), true);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.window.view.contextMenu.devTool,
                        accelerator: 'CmdOrCtrl+Shift+I',
                        enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                        click: () => {
                            view.webContents.isDevToolsOpened() ? view.webContents.devToolsWebContents.focus() : view.webContents.openDevTools();
                        }
                    }
                    ]
                );
            } else {
                menu = Menu.buildFromTemplate(
                    [
                        ...(this.isFullScreen() ? [{
                            label: lang.window.view.contextMenu.fullScreen.fullScreenExit,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/fullscreen_exit.png`,
                            accelerator: 'F11',
                            click: () => {
                                this.isFullScreenToolbar = false;
                                this.setFullScreen(!this.isFullScreen());
                                this.fixBounds();
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.fullScreen.toolBar,
                            click: () => {
                                this.isFullScreenToolbar = !this.isFullScreenToolbar;
                                this.fixBounds();
                                this.webContents.send(`window-fullScreen-toolBar-${this.windowId}`, { result: this.isFullScreenToolbar });
                            }
                        },
                        { type: 'separator' },
                        ] : []),
                        {
                            label: lang.window.view.contextMenu.back,
                            icon: `${app.getAppPath()}/static/${!view.webContents.canGoBack() ? 'arrow_back_inactive' : `${this.getTheme() ? 'dark' : 'light'}/arrow_back`}.png`,
                            accelerator: 'Alt+Left',
                            enabled: view.webContents.canGoBack(),
                            click: () => {
                                const url = view.webContents.getURL();

                                view.webContents.goBack();
                                if (url.startsWith(`${protocolStr}://error`)) {
                                    if (view.webContents.canGoBack())
                                        view.webContents.goBack();
                                }
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.forward,
                            icon: `${app.getAppPath()}/static/${!view.webContents.canGoForward() ? 'arrow_forward_inactive' : `${this.getTheme() ? 'dark' : 'light'}/arrow_forward`}.png`,
                            accelerator: 'Alt+Right',
                            enabled: view.webContents.canGoForward(),
                            click: () => {
                                const url = view.webContents.getURL();

                                view.webContents.goForward();
                                if (url.startsWith(`${protocolStr}://error`)) {
                                    if (view.webContents.canGoForward())
                                        view.webContents.goForward();
                                }
                            }
                        },
                        {
                            label: !view.webContents.isLoadingMainFrame() ? lang.window.view.contextMenu.reload.reload : lang.window.view.contextMenu.reload.stop,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/${!view.webContents.isLoadingMainFrame() ? 'refresh' : 'close'}.png`,
                            accelerator: 'CmdOrCtrl+R',
                            click: () => { !view.webContents.isLoadingMainFrame() ? view.webContents.reload() : view.webContents.stop(); }
                        },
                        ...(params.mediaType === 'audio' || params.mediaType === 'video' || view.webContents.isCurrentlyAudible() ? [
                            { type: 'separator' },
                            {
                                label: view.webContents.audioMuted ? lang.window.view.contextMenu.media.audioMuteExit : lang.window.view.contextMenu.media.audioMute,
                                icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/audio${view.webContents.audioMuted ? '' : '_mute'}.png`,
                                click: () => {
                                    view.webContents.audioMuted = !view.webContents.audioMuted;

                                    this.getViews();
                                }
                            },
                            {
                                label: lang.window.view.contextMenu.media.pictureInPicture,
                                icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/picture_in_picture.png`,
                                click: () => {
                                    view.webContents.executeJavaScript('togglePictureInPicture()');
                                }
                            }
                        ] : []),
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.savePage,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/save.png`,
                            accelerator: 'CmdOrCtrl+S',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                dialog.showSaveDialog({
                                    defaultPath: `${app.getPath('downloads')}/${view.webContents.getTitle()}`,
                                    filters: [
                                        { name: 'Web ページ', extensions: ['html'] }
                                    ]
                                }).then((result) => {
                                    if (result.canceled) return;
                                    view.webContents.savePage(result.filePath, 'HTMLComplete').then(() => {
                                        console.log('Page was saved successfully.')
                                    }).catch((err) => {
                                        if (!err) console.log('Page Save successfully');
                                    });
                                });
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.print,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/print.png`,
                            accelerator: 'CmdOrCtrl+P',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => { view.webContents.print(); }
                        },
                        {
                            label: lang.window.view.contextMenu.translate,
                            icon: `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/translate.png`,
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                view.webContents.executeJavaScript(
                                    `(function () {
                                        fetch('https://script.google.com/macros/s/AKfycbyR_DvrDkeXOBWtA-0Zk8BO8ChnIAnunZrKIE4fpveX2P9IL3L8/exec?text=' + encodeURIComponent(document.body.innerText) + '&target=en&source=', {
                                            method: 'GET'
                                        }).then((res) => {
                                            const json = res.json();
                                            console.log(json);
                                            if (!json.result) return;

                                            document.body.innerText = decodeURIComponent(json.targetText);
                                        });
                                    })()`
                                );

                                /*
                                this.hideWindows();
                                if (!this.translateWindow.isVisible()) {
                                    this.translateWindow.showWindow(view.webContents.getURL());
                                } else {
                                    this.translateWindow.hide();
                                }
                                */
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.floatingWindow,
                            type: 'checkbox',
                            checked: this.isFloatingWindow,
                            enabled: (!this.isFullScreen() && !this.isMaximized() && userConfig.get('design.isCustomTitlebar')),
                            click: () => {
                                this.isFloatingWindow = !this.isFloatingWindow;
                                this.fixBounds();
                            }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.viewSource,
                            accelerator: 'CmdOrCtrl+U',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => { this.addView(`view-source:${view.webContents.getURL()}`, true); }
                        },
                        {
                            label: lang.window.view.contextMenu.devTool,
                            accelerator: 'CmdOrCtrl+Shift+I',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                view.webContents.isDevToolsOpened() ? view.webContents.devToolsWebContents.focus() : view.webContents.openDevTools();
                            }
                        }
                    ]
                );
            }

            menu.popup();
        });

        view.webContents.session.on('will-download', (e, item, webContents) => {
            if (id !== webContents.id) return;

            const str = this.getRandString(12);
            if (item.getMimeType() === 'application/pdf') {
                item.savePath = join(app.getPath('userData'), 'Users', config.get('currentUser'), `${item.getFilename()}.pdf`);

                item.once('done', (e, state) => {
                    const filePath = item.savePath;
                    this.data.updateDownload(str, item.getFilename(), item.getURL(), item.getMimeType(), item.getTotalBytes(), item.getSavePath(), item.getState());
                    if (state === 'completed') {
                        this.webContents.send(`notification-${this.windowId}`, { id: id, content: `${item.getFilename()} のダウンロードが完了しました。` });

                        if (!Notification.isSupported()) return;
                        const notify = new Notification({
                            icon: join(app.getAppPath(), 'static', 'app', 'icon.png'),
                            title: 'ダウンロード完了',
                            body: `${item.getFilename()} のダウンロードが完了しました。\n詳細はここをクリックしてください。`
                        });

                        notify.show();

                        notify.on('click', (e) => {
                            if (filePath !== undefined)
                                shell.openItem(filePath);
                        });
                    } else {
                        console.log(`Download failed: ${state}`);
                    }
                });
            } else {
                this.data.updateDownload(str, item.getFilename(), item.getURL(), item.getMimeType(), item.getTotalBytes(), item.getSavePath(), item.getState());

                item.on('updated', (e, state) => {
                    this.data.updateDownload(str, item.getFilename(), item.getURL(), item.getMimeType(), item.getTotalBytes(), item.getSavePath(), item.getState());
                });

                item.once('done', (e, state) => {
                    const filePath = item.savePath;
                    this.data.updateDownload(str, item.getFilename(), item.getURL(), item.getMimeType(), item.getTotalBytes(), item.getSavePath(), item.getState());
                    if (state === 'completed') {
                        this.webContents.send(`notification-${this.windowId}`, { id: id, content: `${item.getFilename()} のダウンロードが完了しました。` });

                        if (!Notification.isSupported()) return;
                        const notify = new Notification({
                            icon: join(app.getAppPath(), 'static', 'app', 'icon.png'),
                            title: 'ダウンロード完了',
                            body: `${item.getFilename()} のダウンロードが完了しました。\n詳細はここをクリックしてください。`
                        });

                        notify.show();

                        notify.on('click', (e) => {
                            if (filePath !== undefined)
                                shell.openItem(filePath);
                        });
                    } else {
                        console.log(`Download failed: ${state}`);
                    }
                });
            }
        });

        view.webContents.loadURL(url);
        this.views.push({ id, view, isFixed: false, isNotificationBar: false });

        if (isActive) {
            this.menuWindow.destroy();
            this.menuWindow = new MenuWindow(this, this.windowId, id);
            this.webContents.send(`tab-select-${this.windowId}`, { id });
            this.setBrowserView(view);
        }

        this.fixBounds();
        this.getViews();
    }


    getColor = (view) => {
        return new Promise((resolve, reject) => {
            if (view !== null && !view.webContents.isDestroyed() && view.webContents !== null) {
                view.webContents.executeJavaScript(
                    `(function () {
                        const heads = document.head.children;
                        for (var i = 0; i < heads.length; i++) {
                            if (heads[i].getAttribute('name') === 'theme-color') {
                                return heads[i].getAttribute('content');
                            }
                        } 
                    })()`,
                    false,
                    async (result) => resolve(result ?? userConfig.get('design.tabAccentColor'))
                );
            } else {
                reject(new Error('WebContents are not available'));
            }
        });
    }

    getZoom = (id) => {
        if (this.isDestroyed()) return;

        const item = this.findView(id);
        if (this.isNullOrUndefined(item)) return;

        let webContents = item.view.webContents;

        this.webContents.send(`browserView-zoom-${this.windowId}`, { result: webContents.zoomFactor });
        this.webContents.send(`browserView-zoom-menu-${this.windowId}`, { result: webContents.zoomFactor });
    }

    getSearchEngine = () => {
        for (var i = 0; i < userConfig.get('searchEngine.searchEngines').length; i++)
            if (userConfig.get('searchEngine.searchEngines')[i].name === userConfig.get('searchEngine.defaultEngine'))
                return userConfig.get('searchEngine.searchEngines')[i];
        return userConfig.get('searchEngine.searchEngines')[0];
    }

    updateState = (view, url = undefined) => {
        this.updateNavigationState(view);
        this.updateViewState(view, url);
    }

    updateNavigationState = (view) => {
        if (this.isDestroyed() || view.webContents.isDestroyed()) return;

        this.webContents.send(`update-navigation-state-${this.windowId}`, {
            id: view.webContents.id,
            canGoBack: view.webContents.canGoBack(),
            canGoForward: view.webContents.canGoForward(),
            isAudioStatus: !view.webContents.audioMuted ? (view.webContents.isCurrentlyAudible() ? 1 : 0) : -1,
        });
    }

    updateViewState = (view, url = undefined) => {
        if (this.isDestroyed() || view.webContents.isDestroyed()) return;

        const title = view.webContents.getTitle();
        const color = userConfig.get('design.tabAccentColor');
        if (url === undefined)
            url = view.webContents.getURL();

        if (url.startsWith(`${protocolStr}://error`)) return;

        const isAudioPlaying = !view.webContents.isCurrentlyAudible();

        this.webContents.send(`browserView-load-${this.windowId}`, { id: view.webContents.id, title, url, icon: this.data.getFavicon(url), color, isAudioPlaying, isBookmarked: this.data.hasBookmark(url, this.isPrivate) });
    }

    getPermission = (name) => {
        switch (name) {
            case 'geolocation':
                return 'location';
            case 'video':
                return 'camera';
            case 'audio':
                return 'mic';
            case 'midiSysex':
                return 'midi';
            case 'pointerLock':
                return 'pointer';
            case 'fullscreen':
                return 'fullScreen';
            default:
                return name;
        }
    }


    getMainMenu = (windowManager) => {
        return Menu.buildFromTemplate([
            ...(platform.isDarwin ? [{
                label: lang.main.app.label,
                submenu: [
                    {
                        label: lang.main.app.about,
                        role: 'about'
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.app.services,
                        role: 'services'
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.app.hide,
                        role: 'hide'
                    },
                    {
                        label: lang.main.app.hideOthers,
                        role: 'hideothers'
                    },
                    {
                        label: lang.main.app.showAll,
                        role: 'unhide'
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.app.quit,
                        role: 'quit'
                    }
                ]
            }] : []),
            {
                label: `${lang.main.file.label}(&F)`,
                accelerator: 'Alt+F',
                submenu: [
                    {
                        accelerator: 'CmdOrCtrl+T',
                        label: lang.main.file.newTab,
                        click: () => this.addView()
                    },
                    {
                        accelerator: 'CmdOrCtrl+N',
                        label: lang.main.file.newWindow,
                        click: () => windowManager.addWindow(false)
                    },
                    {
                        accelerator: 'CmdOrCtrl+Shift+N',
                        label: lang.main.file.openPrivateWindow,
                        click: () => windowManager.addWindow(true)
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.file.savePage,
                        accelerator: 'CmdOrCtrl+S',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            dialog.showSaveDialog({
                                defaultPath: `${app.getPath('downloads')}/${view.webContents.getTitle()}`,
                                filters: [
                                    { name: 'Web ページ', extensions: ['html'] }
                                ]
                            }).then((result) => {
                                if (result.canceled) return;
                                view.webContents.savePage(result.filePath, 'HTMLComplete').then(() => {
                                    console.log('Page was saved successfully.')
                                }).catch((err) => {
                                    if (!err) console.log('Page Save successfully');
                                });
                            });
                        }
                    },
                    {
                        label: lang.main.file.print,
                        accelerator: 'CmdOrCtrl+P',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            view.webContents.print();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.file.settings,
                        accelerator: 'CmdOrCtrl+,',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            this.addTabOrLoadUrl(this.getBrowserView(), `${protocolStr}://settings/`, true);
                        }
                    },
                    { type: 'separator' },
                    {
                        accelerator: 'CmdOrCtrl+W',
                        label: lang.main.file.closeTab,
                        click: () => {
                            if (this.views.length > 1) {
                                this.removeView();
                                this.getViews();
                            } else {
                                this.close();
                            }
                        }
                    },
                    {
                        accelerator: 'CmdOrCtrl+Shift+W',
                        label: lang.main.file.closeWindow,
                        click: () => this.close()
                    }
                ],
            },
            {
                label: `${lang.main.edit.label}(&E)`,
                accelerator: 'Alt+E',
                submenu: [
                    {
                        label: lang.main.edit.undo,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/undo.png` : null,
                        accelerator: 'CmdOrCtrl+Z',
                        role: 'undo'
                    },
                    {
                        label: lang.main.edit.redo,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/redo.png` : null,
                        accelerator: !platform.isDarwin ? 'Ctrl+Y' : 'Cmd+Shift+Z',
                        role: 'redo'
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.edit.cut,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/cut.png` : null,
                        accelerator: 'CmdOrCtrl+X',
                        role: 'cut'
                    },
                    {
                        label: lang.main.edit.copy,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/copy.png` : null,
                        accelerator: 'CmdOrCtrl+C',
                        role: 'copy'
                    },
                    {
                        label: lang.main.edit.paste,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/paste.png` : null,
                        accelerator: 'CmdOrCtrl+V',
                        role: 'paste'
                    },
                    {
                        label: lang.main.edit.delete,
                        accelerator: 'Delete',
                        role: 'delete'
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.edit.selectAll,
                        role: 'selectAll'
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.edit.find,
                        accelerator: 'CmdOrCtrl+F'
                    }
                ]
            },
            {
                label: `${lang.main.view.label}(&V)`,
                accelerator: 'Alt+V',
                submenu: [
                    {
                        label: lang.main.view.fullScreen,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/fullscreen${this.isFullScreen() ? '_exit' : ''}.png` : null,
                        accelerator: !platform.isDarwin ? 'F11' : 'Cmd+Ctrl+F',
                        click: () => {
                            this.setFullScreen(!this.isFullScreen());
                            this.fixBounds();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.view.viewSource,
                        accelerator: 'CmdOrCtrl+U',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            windowManager.getCurrentWindow().addView(`view-source:${view.webContents.getURL()}`, true);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.view.devTool,
                        accelerator: 'CmdOrCtrl+Shift+I',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            view.webContents.isDevToolsOpened() ? view.webContents.closeDevTools() : view.webContents.openDevTools();
                        }
                    },
                    {
                        label: lang.main.view.devTool,
                        accelerator: 'F12',
                        visible: false,
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            view.webContents.isDevToolsOpened() ? view.webContents.closeDevTools() : view.webContents.openDevTools();
                        }
                    },
                    {
                        label: lang.main.view.devToolWindow,
                        accelerator: 'CmdOrCtrl+Shift+F12',
                        visible: false,
                        click: () => {
                            this.webContents.openDevTools({ mode: 'detach' });
                        }
                    }
                ]
            },
            {
                label: `${lang.main.navigate.label}(&N)`,
                accelerator: 'Alt+N',
                submenu: [
                    {
                        label: lang.main.navigate.back,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/arrow_back.png` : null,
                        accelerator: !platform.isDarwin ? 'Alt+Left' : 'Cmd+[',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            const url = view.webContents.getURL();

                            if (view.webContents.canGoBack())
                                view.webContents.goBack();
                            if (url.startsWith(`${protocolStr}://error`)) {
                                if (view.webContents.canGoBack())
                                    view.webContents.goBack();
                            }
                        }
                    },
                    {
                        label: lang.main.navigate.forward,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/arrow_forward.png` : null,
                        accelerator: !platform.isDarwin ? 'Alt+Right' : 'Cmd+]',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            const url = view.webContents.getURL();

                            if (view.webContents.canGoForward())
                                view.webContents.goForward();
                            if (url.startsWith(`${protocolStr}://error`)) {
                                if (view.webContents.canGoForward())
                                    view.webContents.goForward();
                            }
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.navigate.reload,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/refresh.png` : null,
                        accelerator: 'CmdOrCtrl+R',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            !view.webContents.isLoadingMainFrame() ? view.webContents.reload() : view.webContents.stop();
                        }
                    },
                    {
                        label: lang.main.navigate.reload,
                        accelerator: 'F5',
                        visible: false,
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            !view.webContents.isLoadingMainFrame() ? view.webContents.reload() : view.webContents.stop();
                        }
                    },
                    {
                        label: lang.main.navigate.reloadIgnoringCache,
                        accelerator: 'CmdOrCtrl+Shift+R',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            !view.webContents.isLoadingMainFrame() ? view.webContents.reloadIgnoringCache() : view.webContents.stop();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.navigate.home,
                        accelerator: !platform.isDarwin ? 'Alt+Home' : 'Cmd+Shift+H',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            view.webContents.loadURL(userConfig.get('homePage.homeButton.isDefaultHomePage') ? `${protocolStr}://home/` : userConfig.get('homePage.homeButton.defaultPage'));
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.navigate.bookmarks,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/bookmarks.png` : null,
                        accelerator: !platform.isDarwin ? 'Ctrl+B' : 'Cmd+B',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            this.addTabOrLoadUrl(view, `${protocolStr}://bookmarks/`, true);
                        }
                    },
                    {
                        label: lang.main.navigate.history,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/history.png` : null,
                        accelerator: !platform.isDarwin ? 'Ctrl+H' : 'Cmd+Y',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            this.addTabOrLoadUrl(view, `${protocolStr}://history/`, true);
                        }
                    },
                    {
                        label: lang.main.navigate.downloads,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/download.png` : null,
                        accelerator: !platform.isDarwin ? 'Ctrl+D' : 'Cmd+D',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            this.addTabOrLoadUrl(view, `${protocolStr}://downloads/`, true);
                        }
                    }
                ]
            },
            {
                label: `${lang.main.help.label}(&H)`,
                accelerator: 'Alt+N',
                submenu: [
                    {
                        label: lang.main.help.help,
                        icon: !platform.isDarwin ? `${app.getAppPath()}/static/${this.getTheme() ? 'dark' : 'light'}/help_outline.png` : null,
                        accelerator: 'F1',
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            this.addTabOrLoadUrl(view, `${protocolStr}://help/`, true);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.help.feedback,
                        accelerator: 'Alt+Shift+I',
                        click: () => this.application.addAppWindow(`${protocolStr}://feedback/`, 550, 430, false)
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.help.about,
                        click: () => {
                            const view = this.getBrowserViews()[0];
                            if (this.isNullOrUndefined(view)) return;

                            this.addTabOrLoadUrl(view, `${protocolStr}://settings/about`, true);
                        }
                    }
                ]
            },
        ]);
    }

    addTabOrLoadUrl = (view, url, isInternal = false) => {
        isInternal ? (parse(url).protocol === `${protocolStr}:` ? view.webContents.loadURL(url) : this.addView(url, true)) : this.addView(url, true);
    }

    getTheme = () => {
        const userTheme = String(userConfig.get('design.theme')).toLowerCase();
        const baseTheme = String(require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme.base).toLowerCase();

        if (userTheme === 'system' || baseTheme === 'system')
            return nativeTheme.shouldUseDarkColors;
        else if (userTheme === 'light' || baseTheme === 'light')
            return false;
        else if (userTheme === 'dark' || baseTheme === 'dark')
            return true;
    }

    loadSessionAndProtocol = (partition, isPrivate = false) => {
        const ses = session.fromPartition(partition);
        ses.setUserAgent(`${ses.getUserAgent().replace(name, app_name).replace(/ Electron\/[A-z0-9-\.]*/g, '')}${isPrivate ? ' PrivMode' : ''}`);

        ses.setPermissionRequestHandler(async (webContents, permission, callback, details) => {
            const { protocol, hostname, port } = new URL(webContents.getURL());

            const getPortString = () => {
                switch (protocol) {
                    case 'ftp:':
                        return `:${port === '' ? '21' : port}`;
                    case 'file:':
                        return '';
                    case 'gopher:':
                        return `:${port === '' ? '70' : port}`;
                    case 'http:':
                    case 'ws:':
                        return `:${port === '' ? '80' : port}`;
                    case 'https:':
                    case 'wss:':
                        return `:${port === '' ? '443' : port}`;
                    default: return port;
                }
            }

            const origin = `${protocol}//${hostname}${getPortString()}`;

            const type = this.getPermission(permission === 'media' ? details.mediaTypes.toString() : permission);
            const userConfigPath = `pageSettings.permissions.${type}`;

            const pageSettings = this.data.getPageSettings(origin, type);

            console.log(origin, type, userConfigPath, pageSettings);
            if (pageSettings !== undefined) {
                return callback(pageSettings.result);
            } else {
                if (userConfig.get(userConfigPath) === null || userConfig.get(userConfigPath) === -1) {
                    const results = await this.permissionWindow.showWindow(type, webContents.getURL());
                    const { result, isChecked } = results;

                    if (isChecked)
                        this.data.updatePageSettings(origin, type, result);

                    callback(result);
                } else if (userConfig.get(userConfigPath) === 0) {
                    return callback(false);
                } else if (userConfig.get(userConfigPath) === 1) {
                    return callback(true);
                }
            }
        });

        if (!ses.protocol.isProtocolRegistered(protocolStr)) {
            ses.protocol.registerFileProtocol(protocolStr, (request, callback) => {
                const parsed = parse(request.url);

                callback({
                    path: join(app.getAppPath(), 'pages', parsed.pathname === '/' || !parsed.pathname.match(/(.*)\.([A-z0-9])\w+/g) ? `${parsed.hostname}.html` : `${parsed.hostname}${parsed.pathname}`),
                });
            });
        }

        if (!ses.protocol.isProtocolRegistered(fileProtocolStr)) {
            ses.protocol.registerFileProtocol(fileProtocolStr, (request, callback) => {
                const parsed = parse(request.url);

                callback({ path: join(app.getPath('userData'), 'Users', config.get('currentUser'), parsed.pathname) });
            });
        }
    }


    getRandString = (length) => {
        const char = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const charLength = char.length;

        let str = '';
        for (var i = 0; i < length; i++)
            str += char[Math.floor(Math.random() * charLength)];

        return str;
    }

    isNullOrUndefined = (obj) => obj === undefined || obj === null;
    isEmptyOrDestroy = (obj) => this.isNullOrUndefined(obj) || obj.isDestroyed() || obj.webContents.isDestroyed();
}