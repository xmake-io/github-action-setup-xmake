import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as io from '@actions/io';
import * as cache from '@actions/cache';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as fsutils from './fsutils';

export async function loadBuildCache(): Promise<void> {
    const buildCache = core.getBooleanInput('build-cache');
    if (!buildCache) {
        return;
    }

    // export $XMAKE_ACTION_BUILD_CACHE, xmake will check it and enable build cache by default on ci.
    core.exportVariable('XMAKE_ACTION_BUILD_CACHE', 'true');

    const buildCacheFolder = '.xmake-build-cache';

    let buildCacheKey = core.getInput('build-cache-key');
    if (!buildCacheKey) {
        buildCacheKey = '';
    }
    const cacheKey = `xmake-build-cache-${buildCacheKey}-${os.arch()}-${os.platform()}-${
        process.env.RUNNER_OS ?? 'unknown'
    }`;

    let buildCachePath = core.getInput('build-cache-path');
    if (!buildCachePath) {
        buildCachePath = 'build/.build_cache';
    }

    if (buildCacheFolder && process.env.GITHUB_WORKSPACE) {
        const fullCachePath = path.join(process.env.GITHUB_WORKSPACE, buildCacheFolder);
        const filepath = path.join(fullCachePath, 'build_cache_saved.txt');
        if (!fsutils.isFile(filepath)) {
            core.info(`Restore build cache path: ${fullCachePath} to ${buildCachePath}, key: ${cacheKey}`);
            await cache.restoreCache([buildCacheFolder], cacheKey);
        }
        if (fsutils.isFile(filepath)) {
            await io.cp(fullCachePath, buildCachePath, {
                recursive: true,
            });
        } else {
            core.warning(`No cached files found at path "${fullCachePath}".`);
            await io.rmRF(fullCachePath);
        }
    }
}

export async function saveBuildCache(): Promise<void> {
    const buildCache = core.getBooleanInput('build-cache');
    if (!buildCache) {
        return;
    }

    const buildCacheFolder = '.xmake-build-cache';

    let buildCacheKey = core.getInput('build-cache-key');
    if (!buildCacheKey) {
        buildCacheKey = '';
    }
    const cacheKey = `xmake-build-cache-${buildCacheKey}-${os.arch()}-${os.platform()}-${
        process.env.RUNNER_OS ?? 'unknown'
    }`;

    let buildCachePath = core.getInput('build-cache-path');
    if (!buildCachePath) {
        buildCachePath = 'build/.build_cache';
    }

    if (buildCacheFolder && process.env.GITHUB_WORKSPACE && fsutils.isDir(buildCachePath)) {
        const fullCachePath = path.join(process.env.GITHUB_WORKSPACE, buildCacheFolder);
        core.info(`Save build cache path: ${buildCachePath} to ${fullCachePath}, key: ${cacheKey}`);
        await io.cp(buildCachePath, fullCachePath, {
            recursive: true,
        });
        await exec('xmake', ['l', 'os.touch', path.join(fullCachePath, 'build_cache_saved.txt')]);
        await cache.saveCache([buildCacheFolder], cacheKey);
    }
}
