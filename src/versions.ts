import * as core from '@actions/core';
import * as semver from 'semver';
import { lsRemote } from './git';

export async function selectVersion(version?: string): Promise<{ version: string; sha: string }> {
    version = (version ?? core.getInput('xmake-version')) || 'latest';
    if (version.toLowerCase() === 'latest') version = '';
    version = semver.validRange(version);
    if (!version) {
        throw new Error(`Invalid input xmake-version: ${core.getInput('xmake-version')}`);
    }

    const versions = await lsRemote();
    const ver = semver.maxSatisfying(Object.keys(versions), version);
    if (!ver) {
        throw new Error(`No matched releases of xmake-version: ${version}`);
    }

    const sha = versions[ver];
    core.info(`selected xmake v${ver} (commit: ${sha.substr(0, 8)})`);
    return { version: ver, sha };
}
