const { resolve } = require('path');
const { copyFileSync, writeFileSync } = require('fs-extra');

const name = 'flast';
const isStable = (process.argv[2] || 'stable').toLowerCase() === 'stable';
const channel = (process.argv[2] || 'stable').toLowerCase();

const packagePath = './package.json';
const tempPackagePath = './temp-package.json';
const appPackagePath = './app/package.json';
const tempAppPackagePath = './app/temp-package.json';

const package = require(packagePath);
const appPackage = require(appPackagePath);

// 大本のパッケージファイルの変更
copyFileSync(
    resolve(__dirname, packagePath),
    resolve(__dirname, tempPackagePath),
);

const newPackage = {
    ...package,
    name: `${name}${!isStable ? `-${channel}` : ''}`,
    app_channel: channel.charAt(0).toUpperCase() + channel.slice(1)
};

writeFileSync(resolve(__dirname, packagePath), JSON.stringify(newPackage));

// アプリ側のパッケージファイルの変更
copyFileSync(
    resolve(__dirname, appPackagePath),
    resolve(__dirname, tempAppPackagePath),
);

const newAppPackage = {
    ...appPackage,
    name: `${name}${!isStable ? `-${channel}` : ''}`,
    app_channel: channel.charAt(0).toUpperCase() + channel.slice(1)
};

writeFileSync(resolve(__dirname, appPackagePath), JSON.stringify(newAppPackage));

console.log(`Changed channel to ${channel}.`);