const { app, ipcMain, protocol, session, BrowserWindow, nativeImage, nativeTheme } = require('electron');
const path = require('path');
const { parse, format } = require('url');

const MainWindow = require('./Windows/MainWindow');

const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const Config = require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const { downloadFilters } = require('./AdBlock');

const Datastore = require('nedb');
const Data = require('./Data');

module.exports = class WindowManager {

    constructor(defualtConfig) {
        this.windows = new Map();

        this.defualtConfig = defualtConfig;

        this.data = new Data({
            pageSettings: new Datastore({
                filename: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), 'PageSettings.db'),
                autoload: true,
                timestampData: true
            }),
            favicons: new Datastore({
                filename: path.join(app.getPath('userData'), 'Files', 'Favicons.db'),
                autoload: true,
                timestampData: true
            }),

            bookmarks: new Datastore({
                filename: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), 'Bookmarks.db'),
                autoload: true,
                timestampData: true
            }),
            histories: new Datastore({
                filename: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), 'Histories.db'),
                autoload: true,
                timestampData: true
            }),
            downloads: new Datastore({
                filename: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), 'Download.db'),
                autoload: true,
                timestampData: true
            }),

            apps: new Datastore({
                filename: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), 'Apps.db'),
                autoload: true,
                timestampData: true
            })
        });

        const userTheme = String(userConfig.get('design.theme')).toLowerCase();
        const baseTheme = String(require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme.base).toLowerCase();

        if (userTheme === 'system' || baseTheme === 'system')
            nativeTheme.themeSource = 'system';
        else if (userTheme === 'light' || baseTheme === 'light')
            nativeTheme.themeSource = 'light';
        else if (userTheme === 'dark' || baseTheme === 'dark')
            nativeTheme.themeSource = 'dark';

        this.currentWindow = null;

        ipcMain.on('window-add', (e, args) => {
            this.addWindow(args.isPrivate);
        });

        ipcMain.on('feedbackWindow-open', (e, args) => {
            this.addAppWindow(`${protocolStr}://feedback/`, 550, 430, false);
        });

        ipcMain.on('appWindow-add', (e, args) => {
            this.addAppWindow(args.url);
        });

        ipcMain.on('window-fixBounds', (e, args) => {
            this.windows.forEach((value, key) => value.window.fixBounds());
        });

        ipcMain.on('window-change-settings', (e, args) => {
            this.windows.forEach((item, i) => {
                item.window.webContents.send('window-change-settings', {});
                item.window.fixBounds();
            });
        });

        ipcMain.on('update-filters', (e, args) => {
            downloadFilters();
        });

        ipcMain.on('data-permissions-allow', (e, args) => {
            e.sender.send('data-permissions-allow', { data: this.data.getAllowPageSettingsForType(args.type) })
        });

        ipcMain.on('data-permissions-deny', (e, args) => {
            e.sender.send('data-permissions-deny', { data: this.data.getDenyPageSettingsForType(args.type) })
        });

        ipcMain.on('data-favicon-get', (e, args) => {
            e.sender.send('data-favicon-get', { favicon: this.data.getFavicon(args.url) })
        });

        /*
         * ブックマーク・履歴・ダウンロード
         */
        ipcMain.on(`data-bookmark-add`, (e, args) => {
            const { title, url, parentId, isFolder, isPrivate } = args;
            this.data.updateBookmark(title, url, parentId, isFolder, isPrivate);
        });

        ipcMain.on(`data-bookmark-remove`, (e, args) => {
            this.data.removeBookmark(args.url, args.isPrivate);
        });

        ipcMain.on('data-bookmarks-get', (e, args) => {
            const bookmarks = this.data.datas.bookmarks
                .filter((item, i) => item.isPrivate === args.isPrivate)
                .sort((a, b) => {
                    if (a.updatedAt > b.updatedAt) return -1;
                    if (a.updatedAt < b.updatedAt) return 1;
                    return 0;
                });
            e.sender.send('data-bookmarks-get', { bookmarks });
        });

        ipcMain.on('data-bookmarks-clear', (e, args) => {
            this.data.clearBookmarks();
        });

        ipcMain.on('data-history-get', (e, args) => {
            const histories = this.data.datas.histories.sort((a, b) => {
                return (a.updatedAt < b.updatedAt ? 1 : -1);
            });
            e.sender.send('data-history-get', { histories: histories });
        });

        ipcMain.on('data-history-clear', (e, args) => {
            this.data.clearBookmarks();
        });

        ipcMain.on('data-downloads-get', (e, args) => {
            const downloads = this.data.datas.downloads.sort((a, b) => {
                if (a.updatedAt > b.updatedAt) return -1;
                if (a.updatedAt < b.updatedAt) return 1;
                return 0;
            });
            e.sender.send('data-downloads-get', { downloads });
        });

        ipcMain.on('data-downloads-clear', (e, args) => {
            this.data.clearDownloads();
        });

        /*
         * アプリ
         */
        ipcMain.on('data-apps-add', (e, args) => {
            this.data.updateApp(args.id, args.name, args.url);
        });

        ipcMain.on('data-apps-remove', (e, args) => {
            this.data.removeApp(args.id);
        });

        ipcMain.on('data-apps-get', (e, args) => {
            const apps = this.data.datas.apps.sort((a, b) => {
                if (a.updatedAt > b.updatedAt) return -1;
                if (a.updatedAt < b.updatedAt) return 1;
                return 0;
            });
            e.sender.send('data-apps-get', { apps });
        });

        ipcMain.on('data-apps-is', (e, args) => {
            e.sender.send('data-apps-is', { id: args.id, isInstalled: this.data.hasApp(args.id) });
        });

        ipcMain.on('data-apps-clear', (e, args) => {
            this.data.clearApps();
        });

        ipcMain.on('clear-browsing-data', () => {
            const ses = session.defaultSession;

            ses.clearCache();
            ses.clearStorageData({
                storages: [
                    'appcache',
                    'cookies',
                    'filesystem',
                    'indexdb',
                    'localstorage',
                    'shadercache',
                    'websql',
                    'serviceworkers',
                    'cachestorage',
                ]
            });

            config.clear();
            userConfig.clear();

            this.data.clearPageSettings();
            this.data.clearFavicons();

            this.data.clearBookmarks();
            this.data.clearHistories();
            this.data.clearDownloads();

            this.data.clearApps();
        });
    }

    getWindows = () => {
        return this.windows;
    }

    getCurrentWindow = () => {
        return this.currentWindow;
    }

    addWindow = (isPrivate = false, urls = (userConfig.get('startUp.isDefaultHomePage') ? [`${protocolStr}://home/`] : userConfig.get('startUp.defaultPages'))) => {
        const window = new MainWindow(this, this.defualtConfig, isPrivate, this.data, urls);
        const id = window.id;

        !isPrivate ? this.loadSessionAndProtocol() : this.loadSessionAndProtocolWithPrivateMode(window.getWindowId());

        this.windows.set(id, { window, isPrivate });
        window.on('closed', () => this.windows.delete(id));

        return window;
    }

    addAppWindow = (url = userConfig.get('homePage.defaultPage'), width = userConfig.get('window.bounds').width, height = userConfig.get('window.bounds').height, resizable = true) => {
        this.loadSessionAndProtocol();

        const { x, y } = userConfig.get('window.bounds');
        const window = this.getBaseWindow(resizable && userConfig.get('window.isMaximized') ? 1110 : width, resizable && userConfig.get('window.isMaximized') ? 680 : height, 500, 360, x, y, !userConfig.get('design.isCustomTitlebar'), resizable, resizable, resizable);
        const id = window.id;

        resizable && userConfig.get('window.isMaximized') && window.maximize();

        const startUrl = format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true,
            hash: `/app/${id}/${encodeURIComponent(url)}`,
        });

        window.loadURL(startUrl);
        // window.webContents.openDevTools({ mode: 'detach' });

        window.once('ready-to-show', () => window.show());

        window.on('maximize', () => window.webContents.send(`window-maximized-${id}`, {}));
        window.on('unmaximize', () => window.webContents.send(`window-unmaximized-${id}`, {}));
        window.on('focus', () => window.webContents.send(`window-focus-${id}`, {}));
        window.on('blur', () => window.webContents.send(`window-blur-${id}`, {}));
    }

    fixBounds = (window = new BrowserWindow()) => {
        if (window.getBrowserViews()[0] == undefined) return;
        const view = window.getBrowserViews()[0];

        const { width, height } = window.getContentBounds();

        view.setAutoResize({ width: true, height: true });
        if (window.getFloatingWindow()) {
            window.setMinimizable(false);
            window.setMaximizable(false);
            window.setAlwaysOnTop(true);
            window.visibleOnAllWorkspaces = true;
            window.setVisibleOnAllWorkspaces(true);
            view.setBounds({
                x: 1,
                y: 1,
                width: width - 2,
                height: height - 2,
            });
        } else {
            window.setMinimizable(true);
            window.setMaximizable(true);
            window.setAlwaysOnTop(false);
            window.visibleOnAllWorkspaces = false;
            window.setVisibleOnAllWorkspaces(false);

            if (window.isFullScreen()) {
                view.setBounds({
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                });
            } else {
                view.setBounds({
                    x: window.isMaximized() ? 0 : userConfig.get('design.isCustomTitlebar') ? 1 : 0,
                    y: window.isMaximized() ? this.getHeight(true, height) : userConfig.get('design.isCustomTitlebar') ? this.getHeight(true, height) + 1 : this.getHeight(true, height),
                    width: window.isMaximized() ? width : userConfig.get('design.isCustomTitlebar') ? width - 2 : width,
                    height: window.isMaximized() ? this.getHeight(false, height) : (userConfig.get('design.isCustomTitlebar') ? (this.getHeight(false, height)) - 2 : (this.getHeight(false, height)) - 1),
                });
            }
        }
        view.setAutoResize({ width: true, height: true });
    }

    getHeight = (b, height) => {
        const titleBarHeight = 33;
        const toolBarHeight = 40;

        const baseBarHeight = titleBarHeight + toolBarHeight;
        const bookMarkBarHeight = 28;

        return b ? (userConfig.get('design.isBookmarkBar') ? (baseBarHeight + bookMarkBarHeight) : baseBarHeight) : (height - (userConfig.get('design.isBookmarkBar') ? (baseBarHeight + bookMarkBarHeight) : baseBarHeight));
    }



    getBaseWindow = (width = 1100, height = 680, minWidth = 500, minHeight = 360, x, y, frame = false, resizable = true, minimizable = true, maximizable = true) => {
        return new BrowserWindow({
            width, height, minWidth, minHeight, x, y,
            titleBarStyle: 'hidden',
            frame,
            resizable,
            minimizable,
            maximizable,
            icon: nativeImage.createFromPath(`${__dirname}/static/app/icon.png`),
            fullscreenable: true,
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
    }

    loadSessionAndProtocol = () => {
        if (!protocol.isProtocolRegistered(protocolStr)) {
            protocol.registerFileProtocol(protocolStr, (request, callback) => {
                const parsed = parse(request.url);

                return callback({
                    path: path.join(app.getAppPath(), 'pages', parsed.pathname === '/' || !parsed.pathname.match(/(.*)\.([A-z0-9])\w+/g) ? `${parsed.hostname}.html` : `${parsed.hostname}${parsed.pathname}`),
                });
            }, (error) => {
                if (error) console.error(`[Error] Failed to register protocol: ${error}`);
            });
        }

        if (!protocol.isProtocolRegistered(fileProtocolStr)) {
            protocol.registerFileProtocol(fileProtocolStr, (request, callback) => {
                const parsed = parse(request.url);

                return callback({
                    path: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), parsed.pathname),
                });
            }, (error) => {
                if (error) console.error(`[Error] Failed to register protocol: ${error}`);
            });
        }
    }

    loadSessionAndProtocolWithPrivateMode = (windowId) => {
        const ses = session.fromPartition(windowId);
        ses.setUserAgent(`${ses.getUserAgent().replace(/ Electron\/[A-z0-9-\.]*/g, '')} PrivMode`);

        if (!ses.protocol.isProtocolRegistered(protocolStr)) {
            ses.protocol.registerFileProtocol(protocolStr, (request, callback) => {
                const parsed = parse(request.url);

                return callback({
                    path: path.join(app.getAppPath(), 'pages', parsed.pathname === '/' || !parsed.pathname.match(/(.*)\.([A-z0-9])\w+/g) ? `${parsed.hostname}.html` : `${parsed.hostname}${parsed.pathname}`),
                });
            }, (error) => {
                if (error) console.error(`[Error] Failed to register protocol: ${error}`);
            });
        }

        if (!ses.protocol.isProtocolRegistered(fileProtocolStr)) {
            ses.protocol.registerFileProtocol(fileProtocolStr, (request, callback) => {
                const parsed = parse(request.url);

                return callback({
                    path: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), parsed.pathname),
                });
            }, (error) => {
                if (error) console.error(`[Error] Failed to register protocol: ${error}`);
            });
        }
    }
}