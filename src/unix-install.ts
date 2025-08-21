import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as io from '@actions/io';
import * as toolCache from '@actions/tool-cache';
import * as cache from '@actions/cache';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import * as git from './git';
import { Version } from './interfaces';

async function getPlatformIdentifier(): Promise<string> {
    let identifier = `${os.platform()}-${os.arch()}-${process.env.RUNNER_OS ?? 'unknown'}`;
    if (os.platform() === 'darwin') {
        let productVersion = '';
        try {
            await exec('sw_vers', ['-productVersion'], {
                silent: true,
                listeners: {
                    stdout: (data: Buffer) => {
                        productVersion = data.toString().trim();
                    },
                },
            });
            if (productVersion) {
                identifier += `-${productVersion}`;
            }
        } catch (error: unknown) {
            core.warning(
                `Failed to get macOS product version: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
    return identifier;
}

async function install(sourceDir: string, binDir: string): Promise<void> {
    if (fs.existsSync(path.join(sourceDir, 'configure'))) {
        await exec('sh', ['./configure'], { cwd: sourceDir });
        await exec('make', ['-j6', 'VERBOSE=1'], { cwd: sourceDir });
        await exec('make', ['install', `PREFIX=${binDir}`], { cwd: sourceDir });
    } else {
        await exec('make', ['-j6'], { cwd: sourceDir });
        await exec('make', ['install', `prefix=${binDir}`], { cwd: sourceDir });
    }
}

export async function unixInstall(version: Version): Promise<void> {
    let toolDir = '';
    const actionsCacheFolder = core.getInput('actions-cache-folder');
    let actionsCacheKey = core.getInput('actions-cache-key');
    if (!actionsCacheKey) {
        actionsCacheKey = '';
    }

    if (version.type !== 'local') {
        const ver = version.version;
        const sha = version.sha;
        const platformIdentifier = await getPlatformIdentifier();
        const cacheKey = `xmake-cache-${actionsCacheKey}-${ver}-${sha}-${platformIdentifier}`;

        if (actionsCacheFolder && process.env.GITHUB_WORKSPACE) {
            const fullCachePath = path.join(process.env.GITHUB_WORKSPACE, actionsCacheFolder);
            try {
                try {
                    fs.accessSync(path.join(fullCachePath, 'bin', 'xmake'), fs.constants.X_OK);
                } catch {
                    await cache.restoreCache([actionsCacheFolder], cacheKey);
                }
                fs.accessSync(path.join(fullCachePath, 'bin', 'xmake'), fs.constants.X_OK);
                toolDir = fullCachePath;
                core.info(`cache path: ${toolDir}, key: ${cacheKey}`);
            } catch {
                core.warning(`No cached files found at path "${fullCachePath}".`);
                await io.rmRF(fullCachePath);
            }
        } else {
            toolDir = toolCache.find('xmake', ver);
        }

        if (!toolDir) {
            const sourceDir = await core.group(`download xmake ${String(version)}`, () =>
                git.create(version.repo, version.sha),
            );
            toolDir = await core.group(`install xmake ${String(version)}`, async () => {
                const binDir = path.join(os.tmpdir(), `xmake-${version.sha}`);
                await install(sourceDir, binDir);
                let cacheDir = '';

                if (actionsCacheFolder && process.env.GITHUB_WORKSPACE) {
                    cacheDir = path.join(process.env.GITHUB_WORKSPACE, actionsCacheFolder);
                    await io.cp(binDir, cacheDir, {
                        recursive: true,
                    });
                    await cache.saveCache([actionsCacheFolder], cacheKey);
                } else {
                    cacheDir = await toolCache.cacheDir(binDir, 'xmake', ver);
                }
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

    // xmake l utils.binary.deplibs /Users/ruki/.local/bin/xmake
    await exec(`xmake l --root utils.binary.deplibs ${path.join(toolDir, 'bin', 'xmake')}`);
}
