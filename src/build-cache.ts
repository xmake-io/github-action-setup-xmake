import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as io from '@actions/io';
import * as toolCache from '@actions/tool-cache';
import * as cache from '@actions/cache';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export async function loadBuildCache(): Promise<void> {
    let buildCache = core.getInput('build-cache');
    if (!buildCache) {
        return ;
    }

    const buildCacheFolder = ".xmake-build-cache";

    let buildCacheKey = core.getInput('build-cache-key');
    if (!buildCacheKey) {
        buildCacheKey = '';
    }
    const cacheKey = `xmake-build-cache-${buildCacheKey}-${os.arch()}-${os.platform()}-${
        process.env.RUNNER_OS ?? 'unknown'
    }`;

    let buildCachePath = core.getInput('build-cache-path');
    if (!buildCachePath) {
        buildCachePath = "build/.build_cache";
    }

    if (buildCacheFolder && process.env.GITHUB_WORKSPACE) {
        const fullCachePath = path.join(process.env.GITHUB_WORKSPACE, buildCacheFolder);
        try {
            try {
                fs.accessSync(path.join(fullCachePath, 'build_cache_saved.txt'), fs.constants.X_OK);
            } catch {
                await cache.restoreCache([buildCacheFolder], cacheKey);
            }
            fs.accessSync(path.join(fullCachePath, 'build_cache_saved.txt'), fs.constants.X_OK);
            core.info(`restore build cache path: ${fullCachePath} to ${buildCachePath}, key: ${cacheKey}`);

            // restore build cache
            await io.cp(fullCachePath, buildCachePath, {
                recursive: true,
            });
        } catch {
            core.warning(`No cached files found at path "${fullCachePath}".`);
            await io.rmRF(fullCachePath);
        }
    }
}

export async function saveBuildCache(): Promise<void> {
    let buildCache = core.getInput('build-cache');
    if (!buildCache) {
        return ;
    }

    const buildCacheFolder = ".xmake-build-cache";

    let buildCacheKey = core.getInput('build-cache-key');
    if (!buildCacheKey) {
        buildCacheKey = '';
    }
    const cacheKey = `xmake-build-cache-${buildCacheKey}-${os.arch()}-${os.platform()}-${
        process.env.RUNNER_OS ?? 'unknown'
    }`;

    let buildCachePath = core.getInput('build-cache-path');
    if (!buildCachePath) {
        buildCachePath = "build/.build_cache";
    }

    if (buildCacheFolder && process.env.GITHUB_WORKSPACE) {
        cacheDir = path.join(process.env.GITHUB_WORKSPACE, buildCacheFolder);
        core.info(`save build cache path: ${buildCachePath} to ${cacheDir}, key: ${cacheKey}`);
        await io.cp(buildCachePath, cacheDir, {
            recursive: true,
        });
        await exec("xmake", ["l", "io.touch", path.join(cacheDir, "build_cache_saved.txt")]);
        await cache.saveCache([buildCacheFolder], cacheKey);
    }
}
