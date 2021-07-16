"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _GitVersionImpl_string;
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectVersion = void 0;
const core = require("@actions/core");
const semver = require("semver");
const git_1 = require("./git");
const interfaces_1 = require("./interfaces");
const p = require("path");
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
class GitVersionImpl {
    constructor(repo, version, sha, type, toString) {
        this.repo = repo;
        this.version = version;
        this.sha = sha;
        this.type = type;
        _GitVersionImpl_string.set(this, void 0);
        __classPrivateFieldSet(this, _GitVersionImpl_string, toString, "f");
    }
    toString() {
        return __classPrivateFieldGet(this, _GitVersionImpl_string, "f");
    }
}
_GitVersionImpl_string = new WeakMap();
class LocalVersionImpl {
    constructor(path) {
        this.path = path;
        this.type = 'local';
        this.path = p.resolve(path);
    }
}
async function selectBranch(repo, branch) {
    const versions = await getVersions(repo);
    if (branch in versions.heads) {
        return new GitVersionImpl(repo, branch, versions.heads[branch], 'heads', `branch ${branch}`);
    }
    throw new Error(`Branch ${branch} not found`);
}
async function selectPr(repo, pr) {
    var _a;
    const versions = await getVersions(repo);
    if (pr in versions.pull) {
        const prHeads = versions.pull[pr];
        const sha = (_a = prHeads.merge) !== null && _a !== void 0 ? _a : prHeads.head;
        if (sha) {
            return new GitVersionImpl(repo, `pr#${pr}`, sha, 'pull', `pull request #${pr}`);
        }
    }
    throw new Error(`Pull requrest #${pr} not found`);
}
async function selectSemver(repo, version) {
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
    return new GitVersionImpl(repo, ver, sha, 'tags', ver);
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
    return Promise.resolve(new GitVersionImpl(repo, `sha#${shaValue}`, shaValue, 'sha', `commit ${shaValue.substr(0, 8)}`));
}
async function selectVersion(version) {
    version = (version !== null && version !== void 0 ? version : core.getInput('xmake-version')) || 'latest';
    if (version.toLowerCase() === 'latest')
        version = '';
    let repo = DEFAULT_REPO;
    let ret;
    if (version.startsWith('local#')) {
        const path = version.slice('local#'.length);
        ret = new LocalVersionImpl(path);
    }
    {
        const match = /^([^/#]+\/[^/#]+)#(.+)$/.exec(version);
        if (match) {
            repo = interfaces_1.Repo(match[1]);
            version = match[2];
        }
    }
    if (version.startsWith('branch@')) {
        const branch = version.substr('branch@'.length);
        ret = await selectBranch(repo, branch);
    }
    if (version.startsWith('pr@')) {
        const pr = Number.parseInt(version.substr('pr@'.length));
        if (Number.isNaN(pr) || pr <= 0) {
            throw new Error(`Invalid pull requrest ${version.substr('pr@'.length)}, should be a positive integer`);
        }
        ret = await selectPr(repo, pr);
    }
    if (version.startsWith('sha@')) {
        const sha = version.substr('sha@'.length);
        ret = await selectSha(repo, sha);
    }
    if (semver.validRange(version)) {
        ret = await selectSemver(repo, version);
    }
    if (!ret) {
        throw new Error(`Invalid input xmake-version ${core.getInput('xmake-version')}`);
    }
    if (ret.type === 'local') {
        core.info(`Use local xmake at '${ret.path}'`);
    }
    else {
        core.info(`Selected xmake ${String(ret)} (commit: ${ret.sha.substr(0, 8)})` +
            (repo !== DEFAULT_REPO ? ` of ${repo}` : ''));
    }
    return ret;
}
exports.selectVersion = selectVersion;
