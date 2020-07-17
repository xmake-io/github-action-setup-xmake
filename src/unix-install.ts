import core from '@actions/core';
import { exec } from '@actions/exec';
import io from '@actions/io';
import toolCache from '@actions/tool-cache';
import os from 'os';
import path from 'path';
import semver from 'semver';
import * as git from './git';
import { Version } from './interfaces';

async function install(sourceDir: string, binDir: string): Promise<void> {
    await exec('make', ['build'], { cwd: sourceDir });
    await exec('make', ['install', `prefix=${binDir}`], { cwd: sourceDir });
}

export async function unixInstall(version: Version): Promise<void> {
    let toolDir: string;
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
        // no tool cache for local install
        toolDir = await core.group(`install local xmake at '${version.path}'`, async () => {
            const binDir = path.join(os.tmpdir(), `xmake-${Date.now()}`);
            await install(version.path, binDir);
            return binDir;
        });
    }
    // for versions 2.3.2 and above, xmake will be installed directly into the bin directory, and no script will be used to wrap it.
    if (version.type !== 'tags' || semver.gt(version.version, '2.3.1')) {
        core.addPath(path.join(toolDir, 'bin'));
    } else {
        core.addPath(path.join(toolDir, 'share', 'xmake')); // only for <= 2.3.1
    }
}
