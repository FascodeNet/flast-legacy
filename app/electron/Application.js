const { app, ipcMain, protocol, session, BrowserWindow, Menu } = require('electron');
const { isAbsolute, extname, resolve } = require('path');
const { existsSync, readdirSync, readFileSync } = require('fs-extra');
const os = require('os');

const { isURL, prefixHttp } = require('./URL');

const { name, app_name, app_package_id } = JSON.parse(readFileSync(`${app.getAppPath()}/package.json`, 'utf8'));
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const { autoUpdater } = require('electron-updater');

const { googleAPIKey } = require('./Config.json');

const User = require('./User');
const user = new User();

const WindowManager = require('./WindowManager');

const singleInstance = app.requestSingleInstanceLock();

getBaseWindow = (width = 1100, height = 680, minWidth = 500, minHeight = 360, x, y, frame = false) => {
    return new BrowserWindow({
        width,
        height,
        minWidth,
        minHeight,
        x,
        y,
        'titleBarStyle': 'hidden',
        frame,
        fullscreenable: true,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
            plugins: true,
            experimentalFeatures: true,
            contextIsolation: false,
        }
    });
}

module.exports = class Application {

    loadApplication = async () => {

        user.loadUser();

        protocol.registerSchemesAsPrivileged([
            { scheme: protocolStr, privileges: { standard: true, bypassCSP: true, secure: true } },
            { scheme: fileProtocolStr, privileges: { standard: false, bypassCSP: true, secure: true } }
        ]);

        this.updateStatus = 'not-available';

        autoUpdater.on('checking-for-update', () => {
            console.log('Checking for update...');

            this.updateStatus = 'checking';

            console.log(this.updateStatus);
        });
        autoUpdater.on('update-available', (info) => {
            console.log('Update available.');

            this.updateStatus = 'available';

            console.log(this.updateStatus);
        });
        autoUpdater.on('update-not-available', (info) => {
            console.log('Update not available.');

            this.updateStatus = 'not-available';

            console.log(this.updateStatus);
        });
        autoUpdater.on('error', (err) => {
            console.log('Error in auto-updater. ' + err);

            this.updateStatus = 'error';

            console.log(this.updateStatus);
        });
        autoUpdater.on('download-progress', (progress) => {
            console.log(`Download speed: ${progress.bytesPerSecond} - Downloaded ${progress.percent}% (${progress.transferred} / ${progressObj.total})`);

            this.updateStatus = 'downloading';

            console.log(this.updateStatus);
        });
        autoUpdater.on('update-downloaded', (info) => {
            console.log('Update downloaded.');

            this.updateStatus = 'downloaded';

            console.log(this.updateStatus);
        });

        ipcMain.on('app-updateStatus', (e, args) => {
            console.log(this.updateStatus);
            e.sender.send('app-updateStatus', { result: this.updateStatus });
        });

        this.windowManager = new WindowManager(user.defaultConfig);

        if (!singleInstance) {
            app.quit();
        } else {
            app.on('second-instance', async (e, argv) => {
                const path = argv[argv.length - 1];

                if (isAbsolute(path) && existsSync(path)) {
                    if (process.env.ENV !== 'dev') {
                        const ext = extname(path);

                        if (ext === '.html' || ext === '.htm') {
                            if (BrowserWindow.getAllWindows().length < 1 || this.windowManager.getCurrentWindow() == null) {
                                this.windowManager.addWindow(false, [`file:///${path}`]);
                            } else {
                                const window = this.windowManager.getWindows().get(this.windowManager.getCurrentWindow().id).window;
                                window.addView(`file:///${path}`, false);
                                window.show();
                            }
                        }
                    }
                    return;
                } else if (isURL(path)) {
                    if (BrowserWindow.getAllWindows().length < 1 || this.windowManager.getCurrentWindow() == null) {
                        this.windowManager.addWindow(false, [prefixHttp(path)]);
                    } else {
                        const window = this.windowManager.getWindows().get(this.windowManager.getCurrentWindow().id).window;
                        window.addView(prefixHttp(path), false);
                        window.show();
                    }
                    return;
                } else {
                    this.windowManager.addWindow();
                    return;
                }
            });

            app.on('ready', () => {
                process.env.GOOGLE_API_KEY = googleAPIKey;

                app.setAppUserModelId(app_package_id);
                session.defaultSession.setUserAgent(session.defaultSession.getUserAgent().replace(name, app_name).replace(/ Electron\/[A-z0-9-\.]*/g, ''));

                autoUpdater.checkForUpdatesAndNotify();
                Menu.setApplicationMenu(null);

                this.windowManager.addWindow();
            });

            /*
            app.on('before-quit', async () => {
                await this.windowManager.updateDatabases();
            });
            */

            app.on('window-all-closed', () => {
                console.log('[Debug] 🔥 `window-all-closed`');
                if (process.platform !== 'darwin')
                    app.quit();
            });
        }
    }

    loadExtension = (id) => {
        const extensionDir = resolve(os.homedir(), 'AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions');

        const versions = readdirSync(`${extensionDir}/${id}`).sort();
        const version = versions.pop();

        extensions.loadExtension(`${extensionDir}/${id}/${version}`);
    }

    getRandString = (length) => {
        const char = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const charLength = char.length;

        let str = '';
        for (var i = 0; i < length; i++)
            str += char[Math.floor(Math.random() * charLength)];

        return str;
    }
}