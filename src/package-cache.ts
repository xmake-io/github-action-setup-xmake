import * as core from '@actions/core';
import { exec, ExecOptions } from '@actions/exec';
import * as io from '@actions/io';
import * as cache from '@actions/cache';
import * as os from 'os';
import * as path from 'path';
import * as fsutils from './fsutils';

function getPackageCacheKey(): string {
    let packageCacheKey = core.getInput('package-cache-key');
    if (!packageCacheKey) {
        packageCacheKey = '';
    }
    return `xmake-package-cache-${packageCacheKey}-${os.arch()}-${os.platform()}-${process.env.RUNNER_OS ?? 'unknown'}`;
}

async function getPackageCachePath(): Promise<string> {
    let packageCachePath = '';
    const options: ExecOptions = {};
    options.listeners = {
        stdout: (data: Buffer) => {
            packageCachePath += data.toString();
        },
    };
    packageCachePath = packageCachePath.trim();
    await exec('xmake', ['l', 'core.package.package.installdir'], options);
    core.info(`packageCachePath: ${packageCachePath}`);
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
    const packageCacheKey = getPackageCacheKey();
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
            await io.cp(fullCachePath, packageCachePath, {
                recursive: true,
            });
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
    const packageCacheKey = getPackageCacheKey();
    const packageCachePath = await getPackageCachePath();
    if (!packageCachePath || packageCachePath === '') {
        return;
    }

    if (packageCacheFolder && process.env.GITHUB_WORKSPACE && fsutils.isDir(packageCachePath)) {
        const fullCachePath = path.join(process.env.GITHUB_WORKSPACE, packageCacheFolder);
        core.info(`Save package cache path: ${packageCachePath} to ${fullCachePath}, key: ${packageCacheKey}`);
        await io.cp(packageCachePath, fullCachePath, {
            recursive: true,
        });
        await exec('xmake', ['l', 'os.touch', path.join(fullCachePath, 'package_cache_saved.txt')]);
        await cache.saveCache([packageCacheFolder], packageCacheKey);
    }
}
