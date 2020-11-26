const { app_name } = require(`${__dirname}/../package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

module.exports = {
    main: {
        yes: 'Yes',
        no: 'No',
        doNotShowAgein: 'Do not show again.',
        user: 'User',
        privateMode: 'Private mode',
        app: {
            label: app_name,
            about: `About ${app_name}`,
            services: 'Services',
            hide: `Hide ${app_name}`,
            hideOthers: 'Hide Others',
            showAll: 'Show All',
            quit: `About ${app_name}`
        },
        file: {
            label: 'File',
            newTab: 'New tab',
            newWindow: 'New window',
            openPrivateWindow: 'Open Private window',
            savePage: 'Save page',
            print: 'Print',
            settings: 'Settings',
            closeTab: 'Close tab',
            closeWindow: 'Close window'
        },
        edit: {
            label: 'Edit',
            undo: 'Undo',
            redo: 'Redo',
            cut: 'Cut',
            copy: 'Copy',
            paste: 'Paste',
            delete: 'Delete',
            selectAll: 'Select All',
            find: 'Find on page'
        },
        view: {
            label: 'View',
            fullScreen: 'Toggle Full Screen',
            viewSource: 'View source',
            devTool: 'Developer Tool',
            devToolWindow: 'Developer Tool (Window)',
        },
        navigate: {
            label: 'Navigation',
            back: 'Go back',
            forward: 'Go forward',
            reload: 'Reload',
            reloadIgnoringCache: 'Reload (Clear Cache)',
            home: 'Home page',
            history: 'History',
            downloads: 'Downloads',
            bookmarks: 'Bookmarks'
        },
        help: {
            label: 'Help',
            help: 'Help',
            feedback: 'Send Feedback',
            about: `About ${app_name}`
        }
    },
    window: {
        titleBar: {
            tab: {
                media: {
                    audioPlaying: 'Playing in Media',
                    audioMuted: 'Muted tab'
                },
                close: 'Close this tab',
                new: 'Open a new tab'
            },
            buttons: {
                minimize: 'Minimize',
                maximize: {
                    maximize: 'Maximize',
                    restore: 'Restore (Shrink)'
                },
                close: 'Close'
            }
        },
        toolBar: {
            fullScreenExit: 'Exit Full Screen (F11)',
            back: 'Go back (Alt+Left)',
            forward: 'Go forward (Alt+Right)',
            reload: {
                reload: 'Reload (Ctrl+R)',
                stop: 'Stop loading'
            },
            home: 'Go to the home page',
            addressBar: {
                info: {
                    name: 'Information on this page',
                    clicked: {
                        internal: `Showing protected ${app_name} page`,
                        viewSource: 'Showing page source',
                        file: 'Viewing local or shared file',
                        secure: {
                            title: 'The connection to this site is secure',
                            description: 'The information you send to this site (passwords, credit card information, etc.) will not be seen by any third party.'
                        },
                        insecure: {
                            title: 'The connection to this site is not secure',
                            description: 'Do not enter sensitive information (such as passwords or credit card information) on this site. Malicious users can steal information.'
                        }
                    }
                },
                permission: {
                    title: '{replace} is requesting permission',
                    description: 'Permission: {replace}',
                    check: 'Remember this decision',
                    buttons: {
                        allow: 'Allow',
                        deny: 'Deny'
                    }
                },
                textBox: {
                    suggest: {
                        search: 'Search in {replace}',
                        open: 'Open Website'
                    }
                },
                translate: 'Translate this page',
                zoomDefault: 'Restore default size',
                bookmark: {
                    add: 'Add to bookmark',
                    remove: 'Remove from bookmark',
                    clicked: {
                        add: 'Added to bookmark',
                        remove: 'Removed from bookmark',
                        addPrivate: 'Added to private bookmark',
                        removePrivate: 'Removed from private bookmarks'
                    }
                },
            },
            extensions: {
                adBlock: 'Blocked {replace} ads',
                feedback: 'Send Feedback'
            },
            menu: {
                name: 'Menu',
                menus: {
                    userInformation: {
                        name: 'User information',
                        otherUsers: 'Other users',
                        endPrivateMode: 'End Private mode'
                    },
                    newTab: 'New tab',
                    newWindow: 'New window',
                    openPrivateWindow: 'Open Private window',
                    zoom: {
                        name: 'Zoom',
                        zoomIn: 'Zoom in',
                        zoomOut: 'Zoom out',
                        zoomDefault: 'Default',
                        fullScreen: 'Full Screen'
                    },
                    edit: {
                        name: 'Edit',
                        cut: 'Cut',
                        copy: 'Copy',
                        paste: 'Paste'
                    },
                    bookmarks: 'Bookmarks',
                    history: 'History',
                    downloads: 'Downloads',
                    app: {
                        name: 'Application',
                        list: 'App list',
                        store: 'Flast Store',
                        install: 'Install {title}',
                        uninstall: 'Uninstall {title}',
                        run: 'Launch {title}'
                    },
                    print: 'Print',
                    find: 'Find on page',
                    share: {
                        name: 'Share',
                        linkCopy: 'Copy link',
                        qrCode: 'QR Code'
                    },
                    otherTools: {
                        name: 'Other Tools',
                        savePage: 'Save page',
                        viewSource: 'View source',
                        devTool: 'Developer Tool',
                    },
                    settings: 'Settings',
                    help: {
                        name: 'Help',
                        feedback: 'Send Feedback',
                        about: `About ${app_name}`
                    },
                    quit: 'Quit'
                }
            }
        },
        view: {
            errorMessage: {
                UNDEFINED: {
                    title: '不明なエラーが発生しました',
                    description: '不明なエラーが発生しました。エラーの説明等がまだ翻訳されていないときに表示されます。'
                },
                FILE_NOT_FOUND: {
                    title: 'ファイル・ディレクトリが見つかりませんでした',
                    description: '指定されたパスにファイル・ディレクトリが見つかりませんでした。\nパスが間違っていないかを確認してください。\n再試行するには、ページを再読み込みしてください。'
                },
                TIMED_OUT: {
                    title: 'タイムアウト',
                    description: 'タイムアウトで実行できませんでした。\n再試行するには、ページを再読み込みしてください。'
                },
                FILE_TOO_BIG: {
                    title: 'ファイルサイズが大きすぎます',
                    description: '指定されたパスのファイルが大きすぎます。\n再試行するには、ページを再読み込みしてください。'
                },
                ACCESS_DENIED: {
                    title: 'アクセスが拒否されました',
                    description: '指定されたパスへのアクセスが拒否されました。\nアクセス設定が正しいかを確認してください。\n再試行するには、ページを再読み込みしてください。'
                },
                NOT_IMPLEMENTED: {
                    title: 'この機能は実装されていません',
                    description: '実行しようとした機能は実装されていないため実行できませんでした。\nこのエラーはChromium側で発生することが多いのでFlast側では修正することができません。\nChromium側の更新をお待ちください。'
                },
                INSUFFICIENT_RESOURCES: {
                    title: '操作を完了するのに十分なリソースがありませんでした',
                    description: 'デバイスに負荷がかかっていないかを確かめてください。\n負荷がかかっている場合は負荷が軽減してから再試行してください。\n再試行するには、ページを再読み込みしてください。'
                },
                OUT_OF_MEMORY: {
                    title: 'メモリの割り当てに失敗しました',
                    description: 'メモリの割り当てに失敗しました。メモリが足りていない可能性があります。\nデバイスに負荷がかかっていないかを確かめてください。\n負荷がかかっている場合は負荷が軽減してから再試行してください。\n再試行するには、ページを再読み込みしてください。'
                },
                UPLOAD_FILE_CHANGED: {
                    title: 'ファイルのアップロードに失敗しました',
                    description: 'ファイルのアップロード時間が予想と異なるためファイルのアップロードができませんでした。\n再試行するには、ページを再読み込みしてください。'
                },
                FILE_EXISTS: {
                    title: 'ファイルがすでに存在しています',
                    description: 'ファイルがすでに存在しているため実行できませんでした。\n再試行するには、ページを再読み込みしてください。'
                },
                FILE_PATH_TOO_LONG: {
                    title: 'ファイル名・パスが長すぎます',
                    description: 'ファイル名・パスが長すぎます。\nファイル名・パスを短くしてから実行してください。\n再試行するには、ページを再読み込みしてください。'
                },
                FILE_NO_SPACE: {
                    title: 'ディスクに十分な空きがありません',
                    description: 'ディスクに十分な空きがありませんでした。\n使用していないファイルは削除するなどして、ディスクに十分な空きを作ってから実行してください。\n再試行するには、ページを再読み込みしてください。'
                },
                FILE_VIRUS_INFECTED: {
                    title: 'ファイルにウイルスがあります',
                    description: 'ファイルからウイルスが発見されました。\nそのファイルを実行することはできません。'
                }
            },
            contextMenu: {
                link: {
                    newTab: 'Open link in new tab',
                    newWindow: 'Open link in new window',
                    openPrivateWindow: 'Open link in private window',
                    copy: 'Copy link'
                },
                image: {
                    newTab: 'Open image in new tab',
                    saveImage: 'Save image as',
                    copyImage: 'Copy image',
                    copyLink: 'Copy image link'
                },
                editable: {
                    emotePalette: 'Emote Palette',
                    undo: 'Undo',
                    redo: 'Redo',
                    cut: 'Cut',
                    copy: 'Copy',
                    paste: 'Paste',
                    selectAll: 'Select all'
                },
                selection: {
                    copy: 'Copy',
                    textSearch: 'Search {name} for "{text}"',
                    textLoad: 'Go to {text}'
                },
                fullScreen: {
                    fullScreenExit: 'Exit full screen',
                    toolBar: 'Toggle toolbar',
                },
                back: 'Back',
                forward: 'Forward',
                reload: {
                    reload: 'Reload',
                    stop: 'Stop loading'
                },
                media: {
                    audioMute: 'Mute tab',
                    audioMuteExit: 'Unmute tab',
                    pictureInPicture: 'Picture in Picture'
                },
                savePage: 'Save page',
                print: 'Print',
                translate: 'Translate this page',
                floatingWindow: 'Floating Window (Beta)',
                viewSource: 'View source',
                devTool: 'Developer Tool'
            }
        }
    },
    internalPages: {
        home: {
            title: 'Home',
            menu: {
                name: 'Menu',
                services: {
                    showMenu: 'Show services',
                    hideMenu: 'Hide services',

                    myAccount: 'My Account',
                    search: 'Search',
                    maps: 'Maps',
                    youtube: 'YouTube',
                    news: 'News',
                    gmail: 'Gmail',
                    drive: 'Drive',
                    calendar: 'Calender',
                    translate: 'Translate',
                    documents: 'Document',
                    sheets: 'Spread Sheets',
                    slides: 'Slides'
                }
            },
            bookmarks: {
                title: 'Bookmarks',
                table: {
                    title: 'Title',
                    url: 'URL',
                    date: 'Created at'
                }
            },
            history: {
                title: 'History',
                table: {
                    title: 'Title',
                    url: 'URL',
                    date: 'Viewed at'
                }
            },
            downloads: {
                title: 'Downloads',
                table: {
                    title: 'Title',
                    url: 'URL',
                    status: 'Status',
                    date: 'Downloaded at'
                }
            },
        },
        bookmarks: {
            title: 'Bookmarks',
            clear: 'Clear bookmarks',
            table: {
                title: 'Title',
                url: 'URL',
                date: 'Created at'
            }
        },
        history: {
            title: 'History',
            clear: 'Clear browsing data',
            table: {
                title: 'Title',
                url: 'URL',
                date: 'Viewing date'
            }
        },
        downloads: {
            title: 'Downloads',
            clear: 'Clear download data',
            table: {
                title: 'Title',
                url: 'URL',
                status: 'Status',
                date: 'Start date'
            }
        },
        apps: {
            title: 'Apps'
        },
        settings: {
            title: 'Settings',
            sections: {
                users: {
                    title: 'Users',
                    controls: {
                        login: 'Login',
                        logout: 'Logout'
                    }
                },
                adBlock: {
                    title: 'Ad Block',
                    controls: {
                        useAdBlock: 'Using Ad Blocks',
                        updateAndReload: 'Update & Reload'
                    }
                },
                design: {
                    title: 'Design',
                    controls: {
                        homeButton: {
                            name: 'Show home button',
                            controls: {
                                openWithHomePage: 'Open the home page',
                                openWithCustomPage: 'Open a specific page'
                            }
                        },
                        bookMarkBar: {
                            name: 'Show bookmark bar',
                            controls: {
                                disabled: 'Hide on all pages',
                                onlyHomePage: 'Home page only',
                                enabled: 'Show on all pages'
                            }
                        },
                        theme: {
                            name: 'Theme',
                            controls: {
                                select: 'Change theme',
                                openStore: `Find a theme on the ${app_name} Store`
                            }
                        },
                        accentColor: {
                            name: 'Tab accent color',
                            controls: {
                                reset: 'Reset',
                                select: 'Select color'
                            }
                        },
                        titleBar: {
                            name: 'Use custom title bar (Restart required)',
                            controls: {
                                restart: 'Restart'
                            }
                        },
                        moreSettings: {
                            name: 'Advanced window settings',
                            controls: {
                                change: 'Change'
                            }
                        }
                    }
                },
                homePage: {
                    title: 'Home Page',
                    controls: {
                        pageType: {
                            name: 'The page that appears when you open a new tab',
                            controls: {
                                openWithHomePage: 'Open the home page',
                                openWithCustomPage: 'Open a specific page'
                            }
                        },
                        backgroundType: {
                            name: 'Setting the background of the website',
                            controls: {
                                disabled: 'Disable',
                                dailyImage: 'Enabled (Daily)',
                                customImage: 'Enabled (Custom)'
                            }
                        },
                        backgroundImage: {
                            name: 'Change the background of the website',
                            controls: {
                                upload: 'Upload'
                            }
                        }
                    }
                },
                startUp: {
                    title: 'Startup',
                    controls: {
                        openWithHomePage: 'Open the home page',
                        openWithCustomPageOrPageSet: 'Open a specific page or page set'
                    }
                },
                searchEngine: {
                    title: 'Search Engine',
                    controls: {
                        suggest: 'Enable suggestions',
                        defaultSearchEngine: 'Search engines used in the address bar and on the home page'
                    }
                },
                privacy: {
                    title: 'Privacy',
                    controls: {}
                },
                pageSettings: {
                    title: 'Page Settings',
                    controls: {
                        useDefault: 'Use default',
                        check: 'Check every time',
                        allow: 'Allow',
                        deny: 'Deny',

                        viewDatas: 'View stored permissions on all sites',
                        datas: 'All Sites',

                        default: 'Default',

                        permission: 'Permission',
                        location: 'Location',
                        camera: 'Camera',
                        mic: 'Mic',
                        notifications: 'Notifications',
                        midi: 'MIDI Devices',
                        pointer: 'Lock mouse cursor',
                        fullScreen: 'Full Screen',
                        openExternal: 'Open External Link',

                        noDatas: 'Sites Not found.',

                        content: 'Content',
                        zoomLevels: {
                            name: 'Zoom Levels',
                            controls: {
                                reset: 'Reset'
                            }
                        },
                        pdfDocuments: {
                            name: 'PDF Documents',
                            controls: {
                                isDownload: `Download the PDF file instead of opening it automatically with ${app_name}`,
                                useNewViewer: 'Use new PDF Viewer (Restart required)'
                            }
                        }
                    }
                },
                downloads: {
                    title: 'Downloads',
                    controls: {}
                },
                languages: {
                    title: 'Languages',
                    controls: {}
                },
                about: {
                    title: `About ${app_name}`,
                    controls: {
                        updates: {
                            checking: 'Checking for updates. Please wait...',
                            available: 'Update found. Trying to update...',
                            notAvailable: `${app_name} is latest version. No need to update.`,
                            error: 'We could not confirm the update. Please try again in a while.',
                            downloading: 'Downloading update. Please wait a moment...',
                            downloaded: `Restart and apply the update to ${app_name}.`
                        },
                        version: 'Version',
                        reset: {
                            name: 'Reset',
                            controls: {
                                description: 'Are you sure you want me to reset the data?\nIf you press the "Reset" button, the app is restarted after resetting the data.',
                                cancel: 'Cancel'
                            }
                        }
                    }
                }
            }
        },
        help: {
            title: 'Help'
        },
        feedback: {
            title: 'Send Feedback',
            controls: {
                description: 'Description',
                url: 'URL (Optional)',
                email: 'Mail address (Optional)',
                send: 'Send'
            }
        }
    }
}