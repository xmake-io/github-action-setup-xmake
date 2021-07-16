'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core = require('@actions/core');
const exec_1 = require('@actions/exec');
const os = require('os');
const versions_1 = require('./versions');
const win_install_1 = require('./win-install');
const unix_install_1 = require('./unix-install');
async function run() {
    try {
        const version = await versions_1.selectVersion();
        if (os.platform() === 'win32' || os.platform() === 'cygwin') {
            const latest = await versions_1.selectVersion('latest');
            await win_install_1.winInstall(version, latest);
        } else {
            await unix_install_1.unixInstall(version);
        }
        await exec_1.exec('xmake --version');
    } catch (error) {
        const ex = error;
        core.setFailed(ex.message);
    }
}
run().catch((e) => core.error(e));
