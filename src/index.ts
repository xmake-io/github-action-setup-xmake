import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as os from 'os';
import * as stateHelper from './state-helper';
import { installXmake } from './install';
import { loadBuildCache, saveBuildCache } from './build-cache';
import { loadPackageCache, savePackageCache } from './package-cache';

async function run(): Promise<void> {
    try {
        await installXmake();
        await loadBuildCache();
        await loadPackageCache();
    } catch (error) {
        const ex = error as Error;
        core.setFailed(ex.message);
    }
}

async function saveCache(): Promise<void> {
    try {
        await saveBuildCache();
        await savePackageCache();
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
