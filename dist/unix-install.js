"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unixInstall = void 0;
const core = require("@actions/core");
const exec_1 = require("@actions/exec");
const io = require("@actions/io");
const toolCache = require("@actions/tool-cache");
const os = require("os");
const path = require("path");
const semver = require("semver");
const git = require("./git");
async function unixInstall(version) {
    const ver = version.version;
    let toolDir = toolCache.find('xmake', ver);
    if (!toolDir) {
        const sourceDir = await core.group(`download xmake ${String(version)}`, () => git.create(version.repo, version.sha));
        toolDir = await core.group(`install xmake ${String(version)}`, async () => {
            await exec_1.exec('make', ['build'], { cwd: sourceDir });
            const binDir = path.join(os.tmpdir(), `xmake-${version.sha}`);
            await exec_1.exec('make', ['install', `prefix=${binDir}`], { cwd: sourceDir });
            const cacheDir = await toolCache.cacheDir(binDir, 'xmake', ver);
            await io.rmRF(binDir);
            await git.cleanup(version.sha);
            return cacheDir;
        });
    }
    // for versions 2.3.2 and above, xmake will be installed directly into the bin directory, and no script will be used to wrap it.
    if (version.type !== 'tags' || semver.gt(ver, '2.3.1')) {
        core.addPath(path.join(toolDir, 'bin'));
    }
    else {
        core.addPath(path.join(toolDir, 'share', 'xmake')); // only for <= 2.3.1
    }
}
exports.unixInstall = unixInstall;
