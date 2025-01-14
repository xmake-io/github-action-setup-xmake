import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as os from 'os';
import { selectVersion } from './versions';
import * as stateHelper from './state-helper';
import { winInstall } from './win-install';
import { unixInstall } from './unix-install';

async function installXmake(): Promise<void> {
    const version = await selectVersion();
    if (os.platform() === 'win32' || os.platform() === 'cygwin') {
        const latest = await selectVersion('latest');
        await winInstall(version, latest);
    } else {
        await unixInstall(version);
    }
    await exec('xmake --root --version');
}

async function loadBuildCache(): Promise<void> {}

async function loadPackagesCache(): Promise<void> {}

async function saveBuildCache(): Promise<void> {}

async function savePackagesCache(): Promise<void> {}

async function run(): Promise<void> {
    try {
        await installXmake();
        await loadBuildCache();
        await loadPackagesCache();
    } catch (error) {
        const ex = error as Error;
        core.setFailed(ex.message);
    }
}

async function saveCache(): Promise<void> {
    try {
        await saveBuildCache();
        await savePackagesCache();
    } catch (error) {
        const ex = error as Error;
        core.setFailed(ex.message);
    }
}

if (!stateHelper.IsPost) {
    run().catch((e: Error) => core.error(e));
} else {
    saveCache().catch((e: Error) => core.error(e));
}
