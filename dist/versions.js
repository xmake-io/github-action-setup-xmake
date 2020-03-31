"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const semver = require("semver");
const git_1 = require("./git");
async function selectVersion(version) {
    // get version string
    version = (version !== null && version !== void 0 ? version : core.getInput('xmake-version')) || 'latest';
    if (version.toLowerCase() === 'latest')
        version = '';
    // select branch
    if (version.startsWith('branch@')) {
        const branch = version.substr(7);
        core.info(`Selected xmake branch: ${branch}`);
        return { version: version, sha: branch };
    }
    // select version
    version = semver.validRange(version);
    if (!version) {
        throw new Error(`Invalid input xmake-version: ${core.getInput('xmake-version')}`);
    }
    const versions = await git_1.lsRemote();
    const ver = semver.maxSatisfying(Object.keys(versions), version);
    if (!ver) {
        throw new Error(`No matched releases of xmake-version: ${version}`);
    }
    const sha = versions[ver];
    core.info(`Selected xmake v${ver} (commit: ${sha.substr(0, 8)})`);
    return { version: ver, sha };
}
exports.selectVersion = selectVersion;
