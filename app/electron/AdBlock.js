const { app, session } = require('electron');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const fetch = require('node-fetch');
const { existsSync, readFile, writeFile } = require('fs-extra');
const { resolve, join } = require('path');

const Config = require('electron-store');
const config = new Config();
const userConfig = new Config({
	cwd: join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const PRELOAD_PATH = join(__dirname, './Preloads/Preload.js');

let engine;

/*
if (!existsSync(join(app.getPath('userData'), 'Files')))
	mkdirSync(join(app.getPath('userData'), 'Files'));
*/

const loadFilters = async () => {
	const path = join(app.getPath('userData'), 'Files', 'AdBlock.dat');

	if (existsSync(path)) {
		try {
			const buffer = await readFile(resolve(path));

			try {
				engine = ElectronBlocker.deserialize(buffer);
			} catch (e) {
				return downloadFilters();
			}
		} catch (err) {
			return console.error(err);
		}
	} else {
		return downloadFilters();
	}
};

const downloadFilters = async () => {
	const path = join(app.getPath('userData'), 'Files', 'AdBlock.dat');

	const filters = [];
	await userConfig.get('adBlock.filters').filter((value) => value.isEnabled).forEach((item) => filters.push(item.url));
	engine = await ElectronBlocker.fromLists(fetch, filters);

	try {
		await writeFile(path, engine.serialize());
	} catch (err) {
		if (err) return console.error(err);
	}
};

const runAdblockService = async (partition) => {
	if (!engine)
		await loadFilters();
	engine.enableBlockingInSession(session.fromPartition(partition));
};

const stopAdblockService = async (partition) => {
	engine.disableBlockingInSession(session.fromPartition(partition));
};

const isDisabled = (url) => {
	for (const item of userConfig.get('adBlock.disabledSites'))
		if (String(url).startsWith(item.url))
			return true;
	return false;
}

module.exports = { loadFilters, downloadFilters, runAdblockService, stopAdblockService };