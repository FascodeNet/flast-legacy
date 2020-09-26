const { app } = require('electron');
const { join } = require('path');
const { copySync } = require('fs-extra');

const uuid = require('uuid');
const Config = require('electron-store');

const defaultUser = uuid.v4();

const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const config = new Config({
    defaults: {
        currentUser: defaultUser,
        users: [defaultUser],
        meta: {
            version: '1.0.0'
        }
    }
});

module.exports = class User {

    constructor() {
        this.defaultConfig = {
            profile: {
                avatar: 'flast://resources/icons/icon.png',
                name: ''
            },
            adBlock: {
                isEnabled: true,
                filters: [
                    {
                        name: 'AdBlock Custom Filters',
                        url: 'https://cdn.adblockcdn.com/filters/adblock_custom.txt',
                        isEnabled: true
                    },
                    {
                        name: 'EasyList',
                        url: 'https://easylist-downloads.adblockplus.org/easylist.txt',
                        isEnabled: true
                    },
                    {
                        name: 'Acceptable Ads',
                        url: 'https://easylist-downloads.adblockplus.org/exceptionrules.txt',
                        isEnabled: true
                    },
                    {
                        name: 'Anti-Circumvention Filters',
                        url: 'https://easylist-downloads.adblockplus.org/abp-filters-anti-cv.txt',
                        isEnabled: true
                    },
                    {
                        name: 'EasyPrivacy (privacy protection)',
                        url: 'https://easylist.to/easylist/easyprivacy.txt',
                        isEnabled: true
                    },
                    {
                        name: 'JustDomains',
                        url: 'http://mirror1.malwaredomains.com/files/justdomains',
                        isEnabled: false
                    },
                    {
                        name: 'Adblock Warning Removal list',
                        url: 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt',
                        isEnabled: true
                    },
                    {
                        name: 'Antisocial filter list',
                        url: 'https://easylist-downloads.adblockplus.org/fanboy-social.txt',
                        isEnabled: false
                    },
                    {
                        name: 'Cryptocurrency (Bitcoin) Mining Protection List',
                        url: 'https://raw.githubusercontent.com/hoshsadiq/adblock-nocoin-list/master/nocoin.txt',
                        isEnabled: false
                    },
                    {
                        name: 'Fanboy\'s Annoyances',
                        url: 'https://easylist-downloads.adblockplus.org/fanboy-annoyance.txt',
                        isEnabled: false
                    },
                    {
                        name: 'Malware protection',
                        url: 'https://easylist-downloads.adblockplus.org/malwaredomains_full.txt',
                        isEnabled: true
                    },
                    {
                        name: 'uBlock Origin Filters',
                        url: 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt',
                        isEnabled: false
                    },
                    {
                        name: 'uBlock Origin Badware filters',
                        url: 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt',
                        isEnabled: false
                    },
                    {
                        name: 'uBlock Origin Privacy filters',
                        url: 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt',
                        isEnabled: false
                    },
                    {
                        name: 'uBlock Origin Unbreak filters',
                        url: 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/unbreak.txt',
                        isEnabled: false
                    }
                ],
                disabledSites: []
            },
            design: {
                isHomeButton: false,
                isBookmarkBar: 0,
                theme: 'System',
                tabAccentColor: '#0a84ff',
                isCustomTitlebar: true
            },
            homePage: {
                homeButton: {
                    isDefaultHomePage: true,
                    defaultPage: `${protocolStr}://home`
                },
                newTab: {
                    isDefaultHomePage: true,
                    defaultPage: `${protocolStr}://home`
                },
                homePage: {
                    backgroundType: 0,
                    backgroundImage: ''
                }
            },
            startUp: {
                isDefaultHomePage: true,
                defaultPages: ['flast://home']
            },
            searchEngine: {
                isSuggest: true,
                defaultEngine: 'Google',
                searchEngines: [
                    {
                        name: 'Google',
                        url: 'https://www.google.com/search?q=%s'
                    },
                    {
                        name: 'Bing',
                        url: 'https://www.bing.com/search?q=%s'
                    },
                    {
                        name: 'Yahoo! Japan',
                        url: 'https://search.yahoo.co.jp/search?p=%s'
                    },
                    {
                        name: 'goo',
                        url: 'https://search.goo.ne.jp/web.jsp?MT=%s'
                    },
                    {
                        name: 'OCN',
                        url: 'https://search.goo.ne.jp/web.jsp?MT=%s'
                    },
                    {
                        name: 'Baidu',
                        url: 'https://www.baidu.com/s?wd=%s'
                    },
                    {
                        name: 'Google Translate',
                        url: 'https://translate.google.com/?text=%s'
                    },
                    {
                        name: 'Google Map',
                        url: 'https://www.google.co.jp/maps/search/%s'
                    },
                    {
                        name: 'Youtube',
                        url: 'https://www.youtube.com/results?search_query=%s'
                    },
                    {
                        name: 'NicoVideo',
                        url: 'https://www.nicovideo.jp/search/%s'
                    },
                    {
                        name: 'Twitter',
                        url: 'https://www.twitter.com/search?q=%s'
                    },
                    {
                        name: 'GitHub',
                        url: 'https://github.com/search?q=%s'
                    },
                    {
                        name: 'DuckDuckGo',
                        url: 'https://duckduckgo.com/?q=%s'
                    },
                    {
                        name: 'Yahoo',
                        url: 'https://search.yahoo.com/search?p=%s'
                    },
                    {
                        name: 'Amazon',
                        url: 'https://www.amazon.co.jp/s?k=%s'
                    }
                ]
            },
            pageSettings: {
                permissions: {
                    location: -1,
                    camera: -1,
                    mic: -1,
                    notifications: -1,
                    midi: -1,
                    pointer: -1,
                    fullScreen: 1,
                    openExternal: -1
                },
                contents: {
                    zoomLevel: 1,
                    pdfDocuments: true
                },
                pages: {
                    twitter: {
                        url: 'https://twitter.com/*',
                        oldDesign: false,
                        oldDesignIgnore: false
                    }
                }
            },
            language: 'ja',
            window: {
                isCloseConfirm: true,
                isMaximized: false,
                bounds: {
                    width: 1100,
                    height: 680
                }
            },
            meta: {
                version: '1.0.0'
            }
        };
    }

    loadUser = () => {
        const currentUser = config.get('currentUser');
        if (currentUser === '' || !config.get('users').includes(currentUser)) return

        const userPath = join(app.getPath('userData'), 'Users', currentUser);
        new Config({
            cwd: userPath,
            defaults: this.defaultConfig
        });

        const src = join(app.getAppPath(), 'themes');
        const dest = join(userPath, 'Themes');

        copySync(src, dest);
    }
}