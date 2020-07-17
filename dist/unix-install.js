"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unixInstall = void 0;
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const io = __importStar(require("@actions/io"));
const toolCache = __importStar(require("@actions/tool-cache"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const git = __importStar(require("./git"));
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
            const sourceDir = await core.group(`download xmake ${String(version)}`, () => git.create(version.repo, version.sha));
            toolDir = await core.group(`install xmake ${String(version)}`, async () => {
                const binDir = path.join(os.tmpdir(), `xmake-${version.sha}`);
                await install(sourceDir, binDir);
                const cacheDir = await toolCache.cacheDir(binDir, 'xmake', ver);
                await io.rmRF(binDir);
                await git.cleanup(version.sha);
                return cacheDir;
            });
        }
    }
    else {
        toolDir = await core.group(`install local xmake at '${version.path}'`, async () => {
            const binDir = path.join(os.tmpdir(), `xmake-${Date.now()}`);
            await install(version.path, binDir);
            return binDir;
        });
    }
    if (version.type !== 'tags' || semver.gt(version.version, '2.3.1')) {
        core.addPath(path.join(toolDir, 'bin'));
    }
    else {
        core.addPath(path.join(toolDir, 'share', 'xmake'));
    }
}
exports.unixInstall = unixInstall;
