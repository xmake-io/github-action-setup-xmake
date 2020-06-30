import * as core from '@actions/core';
import * as semver from 'semver';
import { lsRemote } from './git';
import { RefDic, Sha, Version, Repo } from './interfaces';

const DEFAULT_REPO = Repo('xmake-io/xmake');

const VERSIONS = new Map<Repo, RefDic>();
async function getVersions(repo: Repo): Promise<RefDic> {
    const cache = VERSIONS.get(repo);
    if (cache) return cache;
    const result = await lsRemote(repo);
    VERSIONS.set(repo, result);
    return result;
}

class VersionImpl implements Version {
    constructor(readonly repo: Repo, readonly version: string, readonly sha: Sha, readonly type: Version['type'], toString: string) {
        this.#string = toString;
    }
    readonly #string: string;
    toString(): string {
        return this.#string;
    }
}

async function selectBranch(repo: Repo, branch: string): Promise<Version> {
    const versions = await getVersions(repo);
    if (branch in versions.heads) {
        return new VersionImpl(repo, branch, versions.heads[branch], 'heads', `branch ${branch}`);
    }
    throw new Error(`Branch ${branch} not found`);
}

async function selectPr(repo: Repo, pr: number): Promise<Version> {
    const versions = await getVersions(repo);
    if (pr in versions.pull) {
        const prheads = versions.pull[pr];
        const sha = prheads.merge ?? prheads.head;
        if (sha) {
            return new VersionImpl(repo, `pr#${pr}`, sha, 'pull', `pull request #${pr}`);
        }
    }
    throw new Error(`Pull requrest #${pr} not found`);
}

async function selectSemver(repo: Repo, version: string): Promise<Version> {
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

async function selectSha(repo: Repo, sha: string): Promise<Version> {
    const shaValue = Sha(sha);
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
        if ((prData.merge ?? prData.head) === shaValue) {
            return selectPr(repo, Number.parseInt(pr));
        }
    }
    return Promise.resolve(new VersionImpl(repo, `sha#${shaValue}`, shaValue, 'sha', `commit ${shaValue.substr(0, 8)}`));
}

export async function selectVersion(version?: string): Promise<Version> {
    // get version string
    version = (version ?? core.getInput('xmake-version')) || 'latest';
    if (version.toLowerCase() === 'latest') version = '';

    let repo = DEFAULT_REPO;
    let ret: Version | undefined;
    {
        const match = /^([^/#]+\/[^/#]+)#(.+)$/.exec(version);
        if (match) {
            repo = Repo(match[1]);
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
    core.info(`Selected xmake ${String(ret)} (commit: ${ret.sha.substr(0, 8)})` + (repo !== DEFAULT_REPO ? ` of ${repo}` : ''));
    return ret;
}
