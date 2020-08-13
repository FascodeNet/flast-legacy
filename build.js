const { build, Platform } = require('electron-builder');
const { readFileSync } = require('fs-extra');

const { author, app_name, app_channel, app_copyright, app_package_id, app_url } = JSON.parse(readFileSync('./app/package.json', 'utf8'));
const channel = app_channel !== 'Stable' ? ` ${app_channel}` : '';

const getPlatform = () => {
    switch (process.argv[2] || process.platform) {
        case 'win':
        case 'windows':
        case 'win32':
            return Platform.WINDOWS;
        case 'mac':
        case 'macintosh':
        case 'darwin':
            return Platform.MAC;
        case 'linux':
            return Platform.LINUX;
    }
}

const platform = getPlatform();

build({
    targets: platform.createTarget(),
    config: {
        appId: `${app_package_id}${app_channel !== 'Stable' ? `_${String(app_channel).toLowerCase()}` : ''}`,
        productName: `${app_name}${channel}`,
        copyright: app_copyright,
        icon: './static/icon.png',
        asar: true,
        directories: {
            output: `dist/${app_channel}/${platform.name}`,
            buildResources: 'static'
        },
        publish: {
            provider: 'generic',
            url: `${app_url}/releases/${process.platform}/${app_channel}`,
            channel: app_channel
        },
        fileAssociations: [
            {
                name: 'Document',
                description: `${app_name}${channel}`,
                role: 'Viewer',
                ext: ['html', 'htm', 'php']
            }
        ],
        nsis: {
            include: 'static/installer.nsh',
            installerIcon: 'static/icon.ico',
            uninstallerIcon: 'static/icon.ico'
        },
        win: {
            icon: 'static/icon.ico',
            target: {
                target: 'nsis-web',
                arch: ['ia32', 'x64']
            }
        }
    }
});