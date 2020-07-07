"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _string;
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectVersion = void 0;
const core = require("@actions/core");
const semver = require("semver");
const git_1 = require("./git");
const interfaces_1 = require("./interfaces");
const DEFAULT_REPO = interfaces_1.Repo('xmake-io/xmake');
const VERSIONS = new Map();
async function getVersions(repo) {
    const cache = VERSIONS.get(repo);
    if (cache)
        return cache;
    const result = await git_1.lsRemote(repo);
    VERSIONS.set(repo, result);
    return result;
}
class VersionImpl {
    constructor(repo, version, sha, type, toString) {
        this.repo = repo;
        this.version = version;
        this.sha = sha;
        this.type = type;
        _string.set(this, void 0);
        __classPrivateFieldSet(this, _string, toString);
    }
    toString() {
        return __classPrivateFieldGet(this, _string);
    }
}
_string = new WeakMap();
async function selectBranch(repo, branch) {
    const versions = await getVersions(repo);
    if (branch in versions.heads) {
        return new VersionImpl(repo, branch, versions.heads[branch], 'heads', `branch ${branch}`);
    }
    throw new Error(`Branch ${branch} not found`);
}
async function selectPr(repo, pr) {
    var _a;
    const versions = await getVersions(repo);
    if (pr in versions.pull) {
        const prheads = versions.pull[pr];
        const sha = (_a = prheads.merge) !== null && _a !== void 0 ? _a : prheads.head;
        if (sha) {
            return new VersionImpl(repo, `pr#${pr}`, sha, 'pull', `pull request #${pr}`);
        }
    }
    throw new Error(`Pull requrest #${pr} not found`);
}
async function selectSemver(repo, version) {
    // check version valid
    const v = new semver.Range(version);
    if (!v) {
        throw new Error(`Invalid semver`);
    }
    const versions = await getVersions(repo);
    const ver = semver.maxSatisfying(Object.keys(versions.tags), v);
    if (!ver) {
        throw new Error(`No matched releases of xmake-version ${v.format()}`);
    }
    const sha = versions.tags[ver];
    return new VersionImpl(repo, ver, sha, 'tags', ver);
}
async function selectSha(repo, sha) {
    var _a;
    const shaValue = interfaces_1.Sha(sha);
    const versions = await getVersions(repo);
    for (const branch in versions.heads) {
        if (versions.heads[branch] === shaValue) {
            return selectBranch(repo, branch);
        }
    }
    for (const tag in versions.tags) {
        if (versions.tags[tag] === shaValue) {
            return selectSemver(repo, tag);
        }
    }
    for (const pr in versions.pull) {
        const prData = versions.pull[pr];
        if (((_a = prData.merge) !== null && _a !== void 0 ? _a : prData.head) === shaValue) {
            return selectPr(repo, Number.parseInt(pr));
        }
    }
    return Promise.resolve(new VersionImpl(repo, `sha#${shaValue}`, shaValue, 'sha', `commit ${shaValue.substr(0, 8)}`));
}
async function selectVersion(version) {
    // get version string
    version = (version !== null && version !== void 0 ? version : core.getInput('xmake-version')) || 'latest';
    if (version.toLowerCase() === 'latest')
        version = '';
    let repo = DEFAULT_REPO;
    let ret;
    {
        const match = /^([^/#]+\/[^/#]+)#(.+)$/.exec(version);
        if (match) {
            repo = interfaces_1.Repo(match[1]);
            version = match[2];
        }
    }
    // select branch
    if (version.startsWith('branch@')) {
        const branch = version.substr('branch@'.length);
        ret = await selectBranch(repo, branch);
    }
    // select pr
    if (version.startsWith('pr@')) {
        const pr = Number.parseInt(version.substr('pr@'.length));
        if (Number.isNaN(pr) || pr <= 0) {
            throw new Error(`Invalid pull requrest ${version.substr('pr@'.length)}, should be a positive integer`);
        }
        ret = await selectPr(repo, pr);
    }
    // select sha
    if (version.startsWith('sha@')) {
        const sha = version.substr('sha@'.length);
        ret = await selectSha(repo, sha);
    }
    // select version
    if (semver.validRange(version)) {
        ret = await selectSemver(repo, version);
    }
    if (!ret) {
        throw new Error(`Invalid input xmake-version ${core.getInput('xmake-version')}`);
    }
    core.info(`Selected xmake ${String(ret)} (commit: ${ret.sha.substr(0, 8)})` +
        (repo !== DEFAULT_REPO ? ` of ${repo}` : ''));
    return ret;
}
exports.selectVersion = selectVersion;
