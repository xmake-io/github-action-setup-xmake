import * as core from '@actions/core';
import { exec, ExecOptions } from '@actions/exec';
import * as io from '@actions/io';
import * as cache from '@actions/cache';
import * as path from 'path';
import * as fsutils from './fsutils';
import { getPlatformIdentifier } from './system';

function getBuildTime(hours?: string): string {
    let key = 'BuildTime';
    if (hours && hours !== '') {
        key = key + hours;
    }
    let buildTime = core.getState(key);
    if (!buildTime || buildTime === '') {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        if (!hours || hours === '') {
            hours = String(now.getHours()).padStart(2, '0');
        }
        buildTime = `${year}${month}${day}_${hours}`;
        core.saveState(key, buildTime);
    }
    return buildTime;
}

function getProjectRootPath(): string {
    let projectRootPath = core.getInput('project-path');
    if (!projectRootPath) {
        projectRootPath = process.cwd();
    }
    projectRootPath = projectRootPath.trim();
    if (projectRootPath && projectRootPath !== '' && !path.isAbsolute(projectRootPath)) {
        projectRootPath = path.join(process.cwd(), projectRootPath);
    }
    return projectRootPath;
}

async function getBuildCacheKey(buildCacheTime?: string): Promise<string> {
    let buildCacheKey = core.getInput('build-cache-key');
    if (!buildCacheKey) {
        buildCacheKey = '';
    }
    if (!buildCacheTime || buildCacheTime === '') {
        buildCacheTime = getBuildTime();
    }
    const platformIdentifier = await getPlatformIdentifier();
    return `xmake-build-cache-${buildCacheKey}-${buildCacheTime}-${platformIdentifier}`;
}

async function getBuildCachePath(): Promise<string> {
    let buildCachePath = core.getInput('build-cache-path');
    if (!buildCachePath) {
        buildCachePath = '';
        const projectRootPath = getProjectRootPath();
        if (projectRootPath && projectRootPath !== '' && fsutils.isDir(projectRootPath)) {
            const options: ExecOptions = {};
            options.env = {
                ...process.env,
                XMAKE_ROOT: 'y',
            };
            options.cwd = projectRootPath;
            options.listeners = {
                stdout: (data: Buffer) => {
                    buildCachePath += data.toString();
                },
            };
            await exec(
                'xmake',
                [
                    'l',
                    '-c',
                    'import("core.project.config"); import("private.cache.build_cache"); config.load(); print(build_cache.rootdir())',
                ],
                options,
            );
            buildCachePath = buildCachePath.trim();
            if (buildCachePath !== '' && !path.isAbsolute(buildCachePath)) {
                buildCachePath = path.join(projectRootPath, buildCachePath);
            }
        } else {
            buildCachePath = 'build/.build_cache';
        }
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
    const buildCachePath = await getBuildCachePath();

    if (buildCacheFolder && process.env.GITHUB_WORKSPACE) {
        const fullCachePath = path.join(process.env.GITHUB_WORKSPACE, buildCacheFolder);
        const filepath = path.join(fullCachePath, 'build_cache_saved.txt');
        // Since action/cache cannot overwrite updates, we try to restore the cache from the last 24 hours.
        const now = new Date();
        for (let i = 0; i < 24; i++) {
            const hours = now.getHours() - i;
            if (hours < 0) {
                break;
            }
            const buildCacheKey = await getBuildCacheKey(getBuildTime(String(hours).padStart(2, '0')));
            if (!fsutils.isFile(filepath)) {
                core.info(`Restore build cache path: ${fullCachePath} to ${buildCachePath}, key: ${buildCacheKey}`);
                await cache.restoreCache([buildCacheFolder], buildCacheKey);
            }
            if (fsutils.isFile(filepath)) {
                if (fsutils.isDir(buildCachePath)) {
                    await io.rmRF(buildCachePath);
                }
                await io.cp(fullCachePath, buildCachePath, {
                    recursive: true,
                });
                /* Even if the historical cache is hit, we need to update to the latest cache
                 * Therefore, only when the latest cache is hit, it is a real hit, and we no longer need to update the cache.
                 */
                if (i === 0) {
                    core.saveState('hitBuildCache', 'true');
                }
                break;
            }
        }
        if (!fsutils.isFile(filepath)) {
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
    const buildCacheKey = await getBuildCacheKey();
    const buildCachePath = await getBuildCachePath();

    const hitBuildCache = !!core.getState('hitBuildCache');
    if (!hitBuildCache && buildCacheFolder && process.env.GITHUB_WORKSPACE && fsutils.isDir(buildCachePath)) {
        const fullCachePath = path.join(process.env.GITHUB_WORKSPACE, buildCacheFolder);
        core.info(`Save build cache path: ${buildCachePath} to ${fullCachePath}, key: ${buildCacheKey}`);
        await io.cp(buildCachePath, fullCachePath, {
            recursive: true,
        });
        const options: ExecOptions = {};
        options.env = {
            ...process.env,
            XMAKE_ROOT: 'y',
        };
        await exec('xmake', ['l', 'os.touch', path.join(fullCachePath, 'build_cache_saved.txt')], options);
        await cache.saveCache([buildCacheFolder], buildCacheKey);
    }
}
