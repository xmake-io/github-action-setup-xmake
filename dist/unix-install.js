'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.unixInstall = void 0;
const core = require('@actions/core');
const exec_1 = require('@actions/exec');
const io = require('@actions/io');
const toolCache = require('@actions/tool-cache');
const os = require('os');
const path = require('path');
const semver = require('semver');
const git = require('./git');
async function install(sourceDir, binDir) {
    await exec_1.exec('make', ['build'], { cwd: sourceDir });
    await exec_1.exec('make', ['install', `prefix=${binDir}`], { cwd: sourceDir });
}
async function unixInstall(version) {
    let toolDir;
    if (version.type !== 'local') {
        const ver = version.version;
        toolDir = toolCache.find('xmake', ver);
        if (!toolDir) {
            const sourceDir = await core.group(`download xmake ${String(version)}`, () =>
                git.create(version.repo, version.sha),
            );
            toolDir = await core.group(`install xmake ${String(version)}`, async () => {
                const binDir = path.join(os.tmpdir(), `xmake-${version.sha}`);
                await install(sourceDir, binDir);
                const cacheDir = await toolCache.cacheDir(binDir, 'xmake', ver);
                await io.rmRF(binDir);
                await git.cleanup(version.sha);
                return cacheDir;
            });
        }
    } else {
        toolDir = await core.group(`install local xmake at '${version.path}'`, async () => {
            const binDir = path.join(os.tmpdir(), `xmake-${Date.now()}`);
            await install(version.path, binDir);
            return binDir;
        });
    }
    if (version.type !== 'tags' || semver.gt(version.version, '2.3.1')) {
        core.addPath(path.join(toolDir, 'bin'));
    } else {
        core.addPath(path.join(toolDir, 'share', 'xmake'));
    }
}
exports.unixInstall = unixInstall;
