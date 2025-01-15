import * as core from '@actions/core';
import { exec, ExecOptions } from '@actions/exec';
import * as io from '@actions/io';
import * as cache from '@actions/cache';
import * as os from 'os';
import * as path from 'path';
import * as fsutils from './fsutils';

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

async function getPackageCacheKey(): Promise<string> {
    let packageCacheKey = core.getInput('package-cache-key');
    if (!packageCacheKey) {
        packageCacheKey = '';
    }
    let packageCacheHash = '';
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
                packageCacheHash += data.toString();
            },
        };
        await exec('xmake', ['repo', '--update']);
        await exec('xmake', ['l', 'utils.ci.packageskey'], options);
        packageCacheHash = packageCacheHash.trim();
    }
    return `xmake-package-cache-${packageCacheKey}-${packageCacheHash}-${os.arch()}-${os.platform()}-${process.env.RUNNER_OS ?? 'unknown'}`;
}

async function getPackageCachePath(): Promise<string> {
    let packageCachePath = '';
    const options: ExecOptions = {};
    options.env = {
        ...process.env,
        XMAKE_ROOT: 'y',
    };
    options.listeners = {
        stdout: (data: Buffer) => {
            packageCachePath += data.toString();
        },
    };
    await exec('xmake', ['l', '-c', 'import("core.package.package"); print(package.installdir())'], options);
    packageCachePath = packageCachePath.trim();
    return packageCachePath;
}

function getPackageCacheFolder(): string {
    return '.xmake-package-cache';
}

export async function loadPackageCache(): Promise<void> {
    const packageCache = core.getBooleanInput('package-cache');
    if (!packageCache) {
        return;
    }

    const packageCacheFolder = getPackageCacheFolder();
    const packageCacheKey = await getPackageCacheKey();
    const packageCachePath = await getPackageCachePath();
    if (!packageCachePath || packageCachePath === '') {
        return;
    }

    if (packageCacheFolder && process.env.GITHUB_WORKSPACE) {
        const fullCachePath = path.join(process.env.GITHUB_WORKSPACE, packageCacheFolder);
        const filepath = path.join(fullCachePath, 'package_cache_saved.txt');
        if (!fsutils.isFile(filepath)) {
            core.info(`Restore package cache path: ${fullCachePath} to ${packageCachePath}, key: ${packageCacheKey}`);
            await cache.restoreCache([packageCacheFolder], packageCacheKey);
        }
        if (fsutils.isFile(filepath)) {
            if (fsutils.isDir(packageCachePath)) {
                await io.rmRF(packageCachePath);
            }
            await io.cp(fullCachePath, packageCachePath, {
                recursive: true,
            });
            core.saveState('hitPackageCache', 'true');
        } else {
            core.warning(`No cached files found at path "${fullCachePath}".`);
            await io.rmRF(fullCachePath);
        }
    }
}

export async function savePackageCache(): Promise<void> {
    const packageCache = core.getBooleanInput('package-cache');
    if (!packageCache) {
        return;
    }

    const packageCacheFolder = getPackageCacheFolder();
    const packageCacheKey = await getPackageCacheKey();
    const packageCachePath = await getPackageCachePath();
    if (!packageCachePath || packageCachePath === '') {
        return;
    }

    const hitPackageCache = !!core.getState('hitPackageCache');
    if (!hitPackageCache && packageCacheFolder && process.env.GITHUB_WORKSPACE && fsutils.isDir(packageCachePath)) {
        const fullCachePath = path.join(process.env.GITHUB_WORKSPACE, packageCacheFolder);
        core.info(`Save package cache path: ${packageCachePath} to ${fullCachePath}, key: ${packageCacheKey}`);
        await io.cp(packageCachePath, fullCachePath, {
            recursive: true,
        });
        const options: ExecOptions = {};
        options.env = {
            ...process.env,
            XMAKE_ROOT: 'y',
        };
        await exec('xmake', ['l', 'os.touch', path.join(fullCachePath, 'package_cache_saved.txt')], options);
        await cache.saveCache([packageCacheFolder], packageCacheKey);
    }
}
