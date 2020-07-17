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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _string;
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectVersion = void 0;
const core = __importStar(require("@actions/core"));
const semver_1 = __importDefault(require("semver"));
const git_1 = require("./git");
const interfaces_1 = require("./interfaces");
const path_1 = __importDefault(require("path"));
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
        _string.set(this, void 0);
        __classPrivateFieldSet(this, _string, toString);
    }
    toString() {
        return __classPrivateFieldGet(this, _string);
    }
}
_string = new WeakMap();
class LocalVersionImpl {
    constructor(path) {
        this.path = path;
        this.type = 'local';
        this.path = path_1.default.resolve(path);
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
    const v = new semver_1.default.Range(version);
    if (!v) {
        throw new Error(`Invalid semver`);
    }
    const versions = await getVersions(repo);
    const ver = semver_1.default.maxSatisfying(Object.keys(versions.tags), v);
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
    if (semver_1.default.validRange(version)) {
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
