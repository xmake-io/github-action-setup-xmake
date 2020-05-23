import * as core from '@actions/core';
import * as semver from 'semver';
import { lsRemote, RefDic } from './git';

export interface Version {
    version: string;
    sha: string;
    type: keyof RefDic | 'sha';
}

let VERSIONS: RefDic | undefined;

async function getVersions(): Promise<RefDic> {
    if (VERSIONS) return VERSIONS;
    return (VERSIONS = await lsRemote());
}

class VersionImpl implements Version {
    constructor(readonly version: string, readonly sha: string, readonly type: Version['type'], toString: string) {
        this.#string = toString;
    }
    readonly #string: string;
    toString(): string {
        return this.#string;
    }
}

async function selectBranch(branch: string): Promise<Version> {
    const versions = await getVersions();
    if (branch in versions.heads) {
        return new VersionImpl(branch, versions.heads[branch], 'heads', `branch ${branch}`);
    }
    throw new Error(`Branch ${branch} not found`);
}

async function selectPr(pr: number): Promise<Version> {
    const versions = await getVersions();
    if (pr in versions.pull) {
        const prheads = versions.pull[pr];
        const sha = prheads.merge ?? prheads.head;
        if (sha) {
            return new VersionImpl(`pr#${pr}`, sha, 'pull', `pull request #${pr}`);
        }
    }
    throw new Error(`Pull requrest #${pr} not found`);
}

async function selectSemver(version: string): Promise<Version> {
    // check version valid
    const v = new semver.Range(version);
    if (!v) {
        throw new Error(`Invalid semver`);
    }

    const versions = await getVersions();
    const ver = semver.maxSatisfying(Object.keys(versions.tags), v);
    if (!ver) {
        throw new Error(`No matched releases of xmake-version ${v.format()}`);
    }

    const sha = versions.tags[ver];
    return new VersionImpl(ver, sha, 'tags', ver);
}

async function selectSha(sha: string): Promise<Version> {
    sha = sha.toLowerCase();
    if (!/^[a-f0-9]{40}$/gi.test(sha)) throw new Error(`Invalid sha value ${sha}`);
    const versions = await getVersions();
    for (const branch in versions.heads) {
        if (versions.heads[branch] === sha) {
            return selectBranch(branch);
        }
    }
    for (const tag in versions.tags) {
        if (versions.tags[tag] === sha) {
            return selectSemver(tag);
        }
    }
    return Promise.resolve(new VersionImpl(`sha#${sha}`, sha, 'sha', `commit ${sha.substr(0, 8)}`));
}

export async function selectVersion(version?: string): Promise<Version> {
    // get version string
    version = (version ?? core.getInput('xmake-version')) || 'latest';
    if (version.toLowerCase() === 'latest') version = '';

    let ret: Version | undefined;
    // select branch
    if (version.startsWith('branch@')) {
        const branch = version.substr('branch@'.length);
        ret = await selectBranch(branch);
    }
    // select pr
    if (version.startsWith('pr@')) {
        const pr = Number.parseInt(version.substr('pr@'.length));
        if (Number.isNaN(pr) || pr <= 0) {
            throw new Error(`Invalid pull requrest ${version.substr('pr@'.length)}, should be a positive integer`);
        }
        ret = await selectPr(pr);
    }
    // select sha
    if (version.startsWith('sha@')) {
        const sha = version.substr('sha@'.length);
        ret = await selectSha(sha);
    }
    // select version
    if (semver.validRange(version)) {
        ret = await selectSemver(version);
    }
    if (!ret) {
        throw new Error(`Invalid input xmake-version ${core.getInput('xmake-version')}`);
    }
    core.info(`Selected xmake ${ret} (commit: ${ret.sha.substr(0, 8)})`);
    return ret;
}
