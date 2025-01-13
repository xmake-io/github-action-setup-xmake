import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as os from 'os';
import { selectVersion } from './versions';
import { winInstall } from './win-install';
import { unixInstall } from './unix-install';

async function cacheBuild(): Promise<void> {
}

async function cachePackages(): Promise<void> {
}

async function run(): Promise<void> {
    try {
        const version = await selectVersion();
        if (os.platform() === 'win32' || os.platform() === 'cygwin') {
            const latest = await selectVersion('latest');
            await winInstall(version, latest);
        } else {
            await unixInstall(version);
        }
        await exec('xmake --root --version');
    } catch (error) {
        const ex = error as Error;
        core.setFailed(ex.message);
    }
}

run().catch((e: Error) => core.error(e));
