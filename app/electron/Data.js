const { parse, format } = require('url');

const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

module.exports = class Data {

    constructor(db) {
        this.db = db;

        this.datas = {
            pageSettings: undefined,
            favicons: undefined,

            bookmarks: undefined,
            histories: undefined,
            downloads: undefined,

            apps: undefined
        };

        this.reloadDatas();
    }


    // ページ設定
    updatePageSettings = (origin, type, result) => {
        this.db.pageSettings.update({ origin, type }, { origin, type, result }, { upsert: true });
        this.reloadPageSettings();
    }

    removePageSettings = (origin, type) => {
        this.db.pageSettings.remove({ origin, type }, { multi: true }, (err, removed) => { });
        this.reloadPageSettings();
    }

    getPageSettings = (origin, type) => {
        return this.datas.pageSettings !== undefined ? this.datas.pageSettings.find(item => item.origin === origin && item.type === type) : undefined;
    }

    hasPageSettings = (origin, type) => {
        return this.hasPageSettings(origin, type) !== undefined;
    }

    getAllowPageSettingsForOrigin = (origin) => {
        return this.datas.pageSettings !== undefined ? this.datas.pageSettings.filter(item => item.origin === origin && item.result === true) : [];
    }

    getAllowPageSettingsForType = (type) => {
        console.log(this.datas.pageSettings);
        return this.datas.pageSettings !== undefined ? this.datas.pageSettings.filter(item => item.type === type && item.result === true) : [];
    }

    getDenyPageSettingsForOrigin = (origin) => {
        return this.datas.pageSettings !== undefined ? this.datas.pageSettings.filter(item => item.origin === origin && item.result === false) : [];
    }

    getDenyPageSettingsForType = (type) => {
        return this.datas.pageSettings !== undefined ? this.datas.pageSettings.filter(item => item.type === type && item.result === false) : [];
    }

    clearPageSettings = () => {
        this.db.pageSettings.remove({}, { multi: true });
        this.reloadPageSettings();
    }


    // ファビコン
    updateFavicon = (url, favicon) => {
        const parsed = new URL(url);
        const u = parsed.pathname === '/' ? `${parsed.origin}/` : url;
        this.db.favicons.update({ url: u }, { url: u, favicon }, { upsert: true }, (err, replaced, upsert) => { });
        this.datas.favicons.push({ url: u, favicon });
    }

    getFavicon = (url) => {
        // console.log(this.datas.favicons);

        if (url === undefined || url === null || url === ''
            || url.startsWith(`${protocolStr}://`) || url.startsWith(`${fileProtocolStr}://`)) {
            return undefined;
        } else {
            console.log(url);
            const parsed = new URL(url);
            const defaultFavicon = `https://www.google.com/s2/favicons?domain=${parsed.origin}`;

            if (this.datas.favicons !== undefined) {
                const item = this.datas.favicons.find(item => item.url === (parsed.pathname === '/' ? `${parsed.origin}/` : url));
                return item !== undefined ? item.favicon ?? defaultFavicon : defaultFavicon;
            } else {
                return defaultFavicon;
            }
        }
    }

    clearFavicons = () => {
        this.db.favicons.remove({}, { multi: true });
        this.reloadFavicons();
    }


    // ブックマーク
    updateBookmark = (title, url, parentId = null, isFolder = false, isPrivate = false) => {
        this.db.bookmarks.update({ url }, { title, url, favicon: this.getFavicon(url), parentId, isFolder, isPrivate }, { upsert: true }, (err, docs) => { });
        this.reloadBookmarks();
    }

    removeBookmark = (url, isPrivate = false) => {
        this.db.bookmarks.remove({ url, isPrivate }, { multi: true }, (err, removed) => { });
        this.reloadBookmarks();
    }

    getBookmark = (url, isPrivate = false) => {
        return this.datas.bookmarks !== undefined ? this.datas.bookmarks.find(item => item.url === url && item.isPrivate === isPrivate) : undefined;
    }

    hasBookmark = (url, isPrivate = false) => {
        return this.getBookmark(url, isPrivate) !== undefined;
    }

    clearBookmarks = () => {
        this.db.bookmarks.remove({}, { multi: true });
        this.reloadBookmarks();
    }


    // 履歴
    updateHistory = (title, url) => {
        this.db.histories.update({ url }, { title, url, favicon: this.getFavicon(url) }, { upsert: true }, (err, docs) => { });
        this.reloadHistories();
    }

    removeHistory = (url) => {
        this.db.histories.remove({ url }, { multi: true }, (err, removed) => { });
        this.reloadHistories();
    }

    getHistory = (url) => {
        return this.datas.histories !== undefined ? this.datas.histories.find(item => item.url === url) : undefined;
    }

    hasHistory = (url) => {
        return this.getHistory(url) !== undefined;
    }

    clearHistories = () => {
        this.db.histories.remove({}, { multi: true });
        this.reloadHistories();
    }


    // ダウンロード
    updateDownload = (id, name, url, type, size, path, status) => {
        this.db.downloads.update({ _id: id }, { _id: id, name, url, type, size, path, status }, { upsert: true });
        this.reloadDownloads();
    }

    removeDownload = (id) => {
        this.db.downloads.remove({ _id: id }, { multi: true }, (err, removed) => { });
        this.reloadDownloads();
    }

    getDownload = (id) => {
        return this.datas.downloads !== undefined ? this.datas.downloads.find(item => item._id === id) : undefined;
    }

    hasDownload = (id) => {
        return this.getDownload(id) !== undefined;
    }

    clearDownloads = () => {
        this.db.downloads.remove({}, { multi: true });
        this.reloadDownloads();
    }


    // アプリ
    updateApp = (id, name, url) => {
        this.db.apps.update({ _id: id }, { _id: id, name, url }, { upsert: true });
        this.reloadApps();
    }

    removeApp = (id) => {
        this.db.apps.remove({ _id: id }, { multi: true }, (err, removed) => { });
        this.reloadApps();
    }

    getApp = (id) => {
        return this.datas.apps !== undefined ? this.datas.apps.find(item => item._id === id) : undefined;
    }

    hasApp = (id) => {
        return this.getApp(id) !== undefined;
    }

    clearApps = () => {
        this.db.apps.remove({}, { multi: true });
        this.reloadApps();
    }



    reloadDatas = () => {
        this.reloadPageSettings();
        this.reloadFavicons();

        this.reloadBookmarks();
        this.reloadHistories();
        this.reloadDownloads();

        this.reloadApps();
    }

    reloadPageSettings = () => {
        this.db.pageSettings.find({}, (err, docs) => this.datas.pageSettings = docs);
    }

    reloadFavicons = () => {
        this.db.favicons.find({}, (err, docs) => this.datas.favicons = docs);
    }

    reloadBookmarks = () => {
        this.db.bookmarks.find({}, (err, docs) => this.datas.bookmarks = docs);
    }

    reloadHistories = () => {
        this.db.histories.find({}, (err, docs) => this.datas.histories = docs);
    }

    reloadDownloads = () => {
        this.db.downloads.find({}, (err, docs) => this.datas.downloads = docs);
    }

    reloadApps = () => {
        this.db.apps.find({}, (err, docs) => this.datas.apps = docs);
    }
}