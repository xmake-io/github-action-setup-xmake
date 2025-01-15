import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as io from '@actions/io';
import * as cache from '@actions/cache';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as fsutils from './fsutils';

function getBuildCacheKey(): string {
    let buildCacheKey = core.getInput('build-cache-key');
    if (!buildCacheKey) {
        buildCacheKey = '';
    }
    return `xmake-build-cache-${buildCacheKey}-${os.arch()}-${os.platform()}-${process.env.RUNNER_OS ?? 'unknown'}`;
}

function getBuildCachePath(): string {
    let buildCachePath = core.getInput('build-cache-path');
    if (!buildCachePath) {
        buildCachePath = 'build/.build_cache';
    }
    return buildCachePath;
}

function getBuildCacheFolder(): string {
    return '.xmake-build-cache';
}

export async function loadBuildCache(): Promise<void> {
    const buildCache = core.getBooleanInput('build-cache');
    if (!buildCache) {
        return;
    }

    // export $XMAKE_ACTION_BUILD_CACHE, xmake will check it and enable build cache by default on ci.
    core.exportVariable('XMAKE_ACTION_BUILD_CACHE', 'true');

    const buildCacheFolder = getBuildCacheFolder();
    const buildCacheKey = getBuildCacheKey();
    const buildCachePath = getBuildCachePath();

    if (buildCacheFolder && process.env.GITHUB_WORKSPACE) {
        const fullCachePath = path.join(process.env.GITHUB_WORKSPACE, buildCacheFolder);
        const filepath = path.join(fullCachePath, 'build_cache_saved.txt');
        if (!fsutils.isFile(filepath)) {
            core.info(`Restore build cache path: ${fullCachePath} to ${buildCachePath}, key: ${buildCacheKey}`);
            await cache.restoreCache([buildCacheFolder], buildCacheKey);
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

    const buildCacheFolder = getBuildCacheFolder();
    const buildCacheKey = getBuildCacheKey();
    const buildCachePath = getBuildCachePath();

    if (buildCacheFolder && process.env.GITHUB_WORKSPACE && fsutils.isDir(buildCachePath)) {
        const fullCachePath = path.join(process.env.GITHUB_WORKSPACE, buildCacheFolder);
        core.info(`Save build cache path: ${buildCachePath} to ${fullCachePath}, key: ${buildCacheKey}`);
        await io.cp(buildCachePath, fullCachePath, {
            recursive: true,
        });
        await exec('xmake', ['l', 'os.touch', path.join(fullCachePath, 'build_cache_saved.txt')]);
        await cache.saveCache([buildCacheFolder], buildCacheKey);
    }
}
