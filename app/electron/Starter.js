const Application = require('./Application');

async function run() {
    global.Application = new Application();
    await global.Application.loadApplication();
}

run();