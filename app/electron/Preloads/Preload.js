const { remote, ipcRenderer, shell } = require('electron');
const { app, systemPreferences, nativeTheme } = remote;
const path = require('path');
const { statSync, readFileSync, readdirSync, copy } = require('fs-extra');
const os = require('os');
const fileType = require('file-type');
const platform = require('electron-platform');

const { injectChromeWebstoreInstallButton } = require('./Chrome-WebStore');

const { feedbackSendURL } = JSON.parse(readFileSync(`${app.getAppPath()}/electron/Config.json`, 'utf8'));

const { app_name, description, version, app_channel, app_copyright, app_url } = JSON.parse(readFileSync(`${app.getAppPath()}/package.json`, 'utf8'));
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const Config = require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

// ファイルタイプの列挙体（のつもり）
const FileType = {
    File: 'file',
    Directory: 'directory',
    Unknown: 'unknown'
}

/**
 * ファイルの種類を取得する
 * @param {string} path パス
 * @return {FileType} ファイルの種類
 */
const getFileType = (path) => {
    try {
        const stat = statSync(path);

        switch (true) {
            case stat.isFile():
                return FileType.File;
            case stat.isDirectory():
                return FileType.Directory;
            default:
                return FileType.Unknown;
        }
    } catch (e) {
        return FileType.Unknown;
    }
}

/**
 * 指定したディレクトリ配下のすべてのファイルをリストアップする
 * @param {string} dirPath 検索するディレクトリのパス
 * @return {Array<string>} ファイルのパスのリスト
 */
const listFiles = (dirPath) => {
    const ret = [];
    const paths = readdirSync(dirPath);

    paths.forEach((a) => {
        const path = `${dirPath}/${a}`;

        switch (getFileType(path)) {
            case FileType.File:
                ret.push(path);
                break;
            case FileType.Directory:
                ret.push(...listFiles(path));
                break;
            default:
            /* noop */
        }
    });

    return ret;
};

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getConfigPath = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.path;
}

global.getFiles = (pathName) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return listFiles(path.resolve(__dirname, pathName));
}

global.getFile = (path, json = false) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    if (json) {
        return require(path);
    } else {
        const text = readFileSync(path, 'utf8');
        return text;
    }
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.openInEditor = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    shell.openPath(userConfig.path);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getAppName = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return app_name;
}

global.getAppDescription = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return description;
}

global.getAppVersion = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return version;
}

global.getAppChannel = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return app_channel;
}

global.getAppCopyright = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return app_copyright;
}

global.getAppURL = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return app_url;
}

global.getElectronVersion = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return process.versions.electron;
}

global.getChromiumVersion = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return process.versions.chrome;
}

global.getOSVersion = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return `${os.type()} ${process.getSystemVersion()}`;
}

global.getUpdateStatus = () => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('app-updateStatus', {});
    ipcRenderer.once('app-updateStatus', (e, args) => {
        resolve(args.result);
    });
});

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.clearBrowserData = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    b && ipcRenderer.send('clear-browsing-data', {});
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

/*
 * ファビコン
 */
global.getFavicon = (url) => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('data-favicon-get', { url });
    ipcRenderer.once('data-favicon-get', (e, args) => {
        console.log(args.favicon);
        resolve(args.favicon);
    });
});


/*
 * ブックマーク
 */
global.addBookmark = (title, url, parentId, isFolder = false, isPrivate = false) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send(`data-bookmark-add`, { title, url, parentId, isFolder, isPrivate });
}

global.removeBookmark = (url, isPrivate = false) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send(`data-bookmark-remove`, { url, isPrivate });
}

global.getBookmarks = (isPrivate = false) => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('data-bookmarks-get', { isPrivate });
    ipcRenderer.once('data-bookmarks-get', (e, args) => resolve(args.bookmarks));
});

global.clearBookmarks = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    b && ipcRenderer.send('data-bookmarks-clear', {});
}

/*
 * 履歴
 */
global.getHistories = () => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('data-history-get', {});
    ipcRenderer.once('data-history-get', (e, args) => resolve(args.histories));
});

global.clearHistories = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    b && ipcRenderer.send('data-history-clear', {});
}

/*
 * ダウンロード
 */
global.getDownloads = () => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('data-downloads-get', {});
    ipcRenderer.once('data-downloads-get', (e, args) => resolve(args.downloads));
});

global.clearDownloads = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    b && ipcRenderer.send('data-downloads-clear', {});
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getApps = () => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('data-apps-get', {});
    ipcRenderer.once('data-apps-get', (e, args) => {
        resolve(args.apps);
    });
});

global.clearApps = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    b && ipcRenderer.send('data-apps-clear', {});
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/


global.getProfile = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('profile');
}

global.setProfile = (profile = { avatar: getProfile().avatar, name: getProfile().name }) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('profile', profile);
    ipcRenderer.send('window-change-settings', {});
}

global.setAvatar = (file) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    const sourceFile = readFileSync(file);
    const fileName = `avatar_${Math.round(Math.random() * 1000)}.${fileType(sourceFile).ext}`;
    const targetFile = path.join(app.getPath('userData'), 'Users', config.get('currentUser'), fileName);

    copy(file, targetFile);
    userConfig.set('profile.avatar', `${fileProtocolStr}:///${fileName}`);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getAdBlock = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('adBlock.isEnabled');
}

global.setAdBlock = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('adBlock.isEnabled', b);
    ipcRenderer.send('window-change-settings', {});
}

global.getFilters = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('adBlock.filters');
}

global.setFilters = (list) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('adBlock.filters', list);
    ipcRenderer.send('window-change-settings', {});
    ipcRenderer.send('update-filters', {});
}

global.updateFilters = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('update-filters', {});
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getHomeButton = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('design.isHomeButton');
}

global.setHomeButton = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('design.isHomeButton', b);
    ipcRenderer.send('window-change-settings', {});
}

global.getBookmarkBar = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('design.isBookmarkBar');
}

global.setBookmarkBar = (type) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('design.isBookmarkBar', type);
    ipcRenderer.send('window-change-settings', {});
    ipcRenderer.send('window-fixBounds', {});
}

global.getThemeType = () => {
    const userTheme = String(userConfig.get('design.theme')).toLowerCase();
    const baseTheme = String(require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`).theme.base).toLowerCase();

    if (userTheme === 'system' || baseTheme === 'system')
        return nativeTheme.shouldUseDarkColors;
    else if (userTheme === 'light' || baseTheme === 'light')
        return false;
    else if (userTheme === 'dark' || baseTheme === 'dark')
        return true;
}

global.getTheme = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('design.theme');
}

global.setTheme = (name) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    const baseTheme = String(require(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${name}.json`).theme.base).toLowerCase();
    if (baseTheme === 'system')
        nativeTheme.themeSource = 'system';
    else if (baseTheme === 'light')
        nativeTheme.themeSource = 'light';
    else if (baseTheme === 'dark')
        nativeTheme.themeSource = 'dark';

    userConfig.set('design.theme', name);
    ipcRenderer.send('window-change-settings', {});
}

global.getThemes = () => {
    return listFiles(`${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/`);
}

global.getThemePath = () => {
    return `${app.getPath('userData')}/Users/${config.get('currentUser')}/Themes/${userConfig.get('design.theme') || 'System'}.json`;
}

global.getThemeByFile = (path) => {
    return require(path);
}

global.getThemeColor = () => {
    return platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#1c1c1c';
}

global.getTabAccentColor = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('design.tabAccentColor', '#0a84ff');
}

global.setTabAccentColor = (color) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('design.tabAccentColor', color);
    ipcRenderer.send('window-change-settings', {});
}

global.getCustomTitlebar = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('design.isCustomTitlebar');
}

global.setCustomTitlebar = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('design.isCustomTitlebar', b);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getButtonDefaultHomePage = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('homePage.homeButton.isDefaultHomePage');
}

global.setButtonDefaultHomePage = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('homePage.homeButton.isDefaultHomePage', b);
}

global.getButtonStartPage = (b = true) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return b ? (userConfig.get('homePage.homeButton.isDefaultHomePage') ? `${protocolStr}://home/` : userConfig.get('homePage.homeButton.defaultPage')) : userConfig.get('homePage.homeButton.defaultPage');
}

global.setButtonStartPage = (url) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('homePage.homeButton.defaultPage', url);
}

global.getHomePageBackgroundType = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('homePage.homePage.backgroundType');
}

global.setHomePageBackgroundType = (type) => {
    if (!(location.protocol !== `${protocolStr}://` || location.protocol !== `${fileProtocolStr}://`) || type < -1 || type > 1) return;

    userConfig.set('homePage.homePage.backgroundType', type);
}

global.getHomePageBackgroundImage = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('homePage.homePage.backgroundImage');
}

global.setHomePageBackgroundImage = (data) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('homePage.homePage.backgroundImage', data);
}

global.copyHomePageBackgroundImage = (file) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    const sourceFile = readFileSync(file);
    const fileName = `background_${Math.round(Math.random() * 1000)}.${fileType(sourceFile).ext}`
    const targetFile = path.join(app.getPath('userData'), 'Users', config.get('currentUser'), fileName);

    copy(file, targetFile);
    userConfig.set('homePage.homePage.backgroundImage', `${fileProtocolStr}:///${fileName}`);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/
global.getNewTabDefaultHomePage = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('homePage.newTab.isDefaultHomePage');
}

global.setNewTabDefaultHomePage = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('homePage.newTab.isDefaultHomePage', b);
}

global.getNewTabStartPage = (b = true) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return b ? (userConfig.get('homePage.newTab.isDefaultHomePage') ? `${protocolStr}://home/` : userConfig.get('homePage.newTab.defaultPage')) : userConfig.get('homePage.newTab.defaultPage');
}

global.setNewTabStartPage = (url) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('homePage.newTab.defaultPage', url);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getDefaultHomePage = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('startUp.isDefaultHomePage');
}

global.setDefaultHomePage = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('startUp.isDefaultHomePage', b);
}

global.getStartPages = (b = true) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return b ? (userConfig.get('startUp.isDefaultHomePage') ? [`${protocolStr}://home/`] : userConfig.get('startUp.defaultPages')) : userConfig.get('startUp.defaultPages');
}

global.setStartPages = (urls) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('startUp.defaultPages', urls);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getSearchEngines = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('searchEngine.searchEngines');
}

global.getSearchEngine = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    for (var i = 0; i < userConfig.get('searchEngine.searchEngines').length; i++) {
        if (userConfig.get('searchEngine.searchEngines')[i].name == userConfig.get('searchEngine.defaultEngine')) {
            return userConfig.get('searchEngine.searchEngines')[i];
        }
    }
}

global.setSearchEngine = (name) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    getSearchEngines().some((item, i) => {
        if (item.name && item.name === name)
            userConfig.set('searchEngine.defaultEngine', name);
    });
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getLocation = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.permissions.location', -1);
}

global.setLocation = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.permissions.location', v);
}

global.getCamera = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.permissions.camera', -1);
}

global.setCamera = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.permissions.camera', v);
}

global.getMic = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.permissions.mic', -1);
}

global.setMic = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.permissions.mic', v);
}

global.getNotifications = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.permissions.notifications', -1);
}

global.setNotifications = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.permissions.notifications', v);
}

global.getMidi = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.permissions.midi', -1);
}

global.setMidi = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.permissions.midi', v);
}

global.getPointer = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.permissions.pointer', -1);
}

global.setPointer = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.permissions.pointer', v);
}

global.getFullScreen = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.permissions.fullScreen', 1);
}

global.setFullScreen = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.permissions.fullScreen', v);
}

global.getOpenExternal = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.permissions.openExternal', -1);
}

global.setOpenExternal = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.permissions.openExternal', v);
}


global.getAllowPermissions = (type) => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('data-permissions-allow', { type });
    ipcRenderer.once('data-permissions-allow', (e, args) => {
        resolve(args.data);
    });
});

global.getDenyPermissions = (type) => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('data-permissions-deny', { type });
    ipcRenderer.once('data-permissions-deny', (e, args) => {
        resolve(args.data);
    });
});


global.getZoomLevel = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.contents.zoomLevel', 1);
}

global.setZoomLevel = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.contents.zoomLevel', v);
}


/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getLanguage = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;
    return userConfig.get('language') != undefined ? userConfig.get('language') : 'ja';
}

global.setLanguage = (language) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('language', language);
    ipcRenderer.send('window-change-settings', {});
}

global.getLanguageFile = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;
    return require(`${remote.app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.restart = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    remote.app.relaunch();
    remote.app.exit(0);
}

global.isURL = (input) => {
    const pattern = /^((?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)|flast:\/\/\S.*|flast-file:\/\/\S.*|file:\/\/\S.*)\S*$/;

    return pattern.test(input) ? true : pattern.test(`http://${input}`);
};

global.installApp = (id, name, description, url) => {
    if (!(location.protocol !== `${protocolStr}://` || location.protocol !== `${fileProtocolStr}://` || location.hostname !== 'store.aoichaan0513.xyz' || location.host !== 'localhost:3000')) return;

    ipcRenderer.send('data-apps-add', { id, name, description, url });
}

global.isInstallApp = (id) => new Promise((resolve) => {
    if (!(location.protocol !== `${protocolStr}://` || location.protocol !== `${fileProtocolStr}://` || location.hostname !== 'store.aoichaan0513.xyz' || location.host !== 'localhost:3000')) return;

    ipcRenderer.send('data-apps-is', { id });
    ipcRenderer.once('data-apps-is', (e, args) => {
        resolve([args.id, args.isInstalled]);
    });
});

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.togglePictureInPicture = (i = 0) => {
    if (!document.pictureInPictureElement) {
        if (document.querySelectorAll('video').length > 0 && document.querySelectorAll('video').length > i
            && document.querySelectorAll('video')[i] != undefined) {
            document.querySelectorAll('video')[i].requestPictureInPicture();
            return;
        } else {
            throw Error('Video Element Not found.');
            return;
        }
    } else {
        document.exitPictureInPicture();
        return;
    }
}


global.closeWindow = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;
    remote.getCurrentWindow().close();
}

global.getFeedbackSendURL = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;
    return feedbackSendURL;
}


onload = () => {
    if (location.protocol === `${protocolStr}:` || location.protocol === `${fileProtocolStr}://` || location.hostname === 'store.aoichaan0513.xyz' || location.host === 'localhost:3000') return;

    delete global.getConfigPath;
    delete global.getFiles;
    delete global.getFile;

    delete global.openInEditor;

    delete global.getAppName;
    delete global.getAppDescription;
    delete global.getAppVersion;
    delete global.getAppChannel;
    delete global.getAppCopyright;
    delete global.getAppURL;
    delete global.getElectronVersion;
    delete global.getChromiumVersion;
    delete global.getOSVersion;
    delete global.getUpdateStatus;

    delete global.clearBrowserData;

    delete global.getFavicon;


    delete global.addBookmark;
    delete global.removeBookmark;
    delete global.getBookmarks;
    delete global.clearBookmarks;
    delete global.getHistories;
    delete global.clearHistories;
    delete global.getDownloads;
    delete global.clearDownloads;

    delete global.getApps;
    delete global.clearApps;


    delete global.getProfile;
    delete global.setProfile;
    delete global.setAvatar;


    delete global.getAdBlock;
    delete global.setAdBlock;
    delete global.getFilters;
    delete global.setFilters;
    delete global.updateFilters;


    delete global.getHomeButton;
    delete global.setHomeButton;
    delete global.getBookmarkBar;
    delete global.setBookmarkBar;
    delete global.getThemeType;
    delete global.getTheme;
    delete global.setTheme;
    delete global.getThemes;
    delete global.getThemeByFile;
    delete global.getThemeColor;
    delete global.getTabAccentColor;
    delete global.setTabAccentColor;
    delete global.getCustomTitlebar;
    delete global.setCustomTitlebar;


    delete global.getButtonDefaultHomePage;
    delete global.setButtonDefaultHomePage;
    delete global.getButtonStartPage;
    delete global.setButtonStartPage;
    delete global.getHomePageBackgroundType;
    delete global.setHomePageBackgroundType;
    delete global.getHomePageBackgroundImage;
    delete global.setHomePageBackgroundImage;
    delete global.copyHomePageBackgroundImage;


    delete global.getNewTabDefaultHomePage;
    delete global.setNewTabDefaultHomePage;
    delete global.getNewTabStartPage;
    delete global.setNewTabStartPage;

    delete global.getDefaultHomePage;
    delete global.setDefaultHomePage;
    delete global.getStartPage;
    delete global.setStartPage;


    delete global.getSearchEngines;
    delete global.getSearchEngine;
    delete global.setSearchEngine;


    delete global.getLocation;
    delete global.setLocation;
    delete global.getCamera;
    delete global.setCamera;
    delete global.getMic;
    delete global.setMic;
    delete global.getNotifications;
    delete global.setNotifications;
    delete global.getMidi;
    delete global.setMidi;
    delete global.getPointer;
    delete global.setPointer;
    delete global.getFullScreen;
    delete global.setFullScreen;
    delete global.getOpenExternal;
    delete global.setOpenExternal;

    delete global.getAllowPermissions;
    delete global.getDenyPermissions;


    delete global.getZoomLevel;
    delete global.setZoomLevel;


    delete global.getLanguage;
    delete global.setLanguage;
    delete global.getLanguageFile;


    delete global.restart;
    delete global.isURL;


    delete global.installApp;
    delete global.isInstallApp;

    
    delete closeWindow;
    delete getFeedbackSendURL;
}

onfocus = (e) => {
    ipcRenderer.send(`view-focus-${remote.getCurrentWindow().id}`, {});
}

onmousedown = (e) => {
    if (remote.getCurrentWindow().getBrowserViews()[0] == undefined) return;
    const view = remote.getCurrentWindow().getBrowserViews()[0];

    if (e.button == 3) {
        if (view.webContents.canGoBack())
            view.webContents.goBack();
        if (view.webContents.getURL().startsWith(`${protocolStr}://error`)) {
            if (view.webContents.canGoBack())
                view.webContents.goBack();
            return;
        }
        return;
    } else if (e.button == 4) {
        if (view.webContents.canGoForward())
            view.webContents.goForward();
        if (view.webContents.getURL().startsWith(`${protocolStr}://error`)) {
            if (view.webContents.canGoForward())
                view.webContents.goForward();
            return;
        }
        return;
    }
}

if (window.location.host === 'chrome.google.com')
    injectChromeWebstoreInstallButton();