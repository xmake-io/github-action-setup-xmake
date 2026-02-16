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
import { Version, GitVersion } from './interfaces';
import { selectVersion } from './versions';
import { getPlatformIdentifier } from './system';

async function getInstallerUrl(version: GitVersion, _fallback: boolean = false): Promise<string> {
    const latest = (await selectVersion('latest', _fallback)) as GitVersion;
    const latestVers = latest.version;
    let vers = version.version;
    let finalUrl: string;
    switch (version.type) {
        case 'heads': {
            const arch = os.arch() === 'arm64' ? 'arm64' : os.arch() === 'x64' ? 'win64' : 'win32';
            if (vers !== 'dev' && vers !== 'master') {
                vers = latestVers;
            }
            finalUrl = `https://github.com/xmake-io/xmake/releases/download/${latestVers}/xmake-${vers}.${arch}.exe`;
            break;
        }
        case 'pull': {
            throw new Error('PR builds for windows is not supported');
        }
        case 'sha': {
            throw new Error('Sha builds for windows is not supported');
        }
        case 'tags': {
            const arch = os.arch() === 'arm64' ? 'arm64' : os.arch() === 'x64' ? 'win64' : 'win32';
            finalUrl = semver.gt(vers, '2.2.6')
                ? `https://github.com/xmake-io/xmake/releases/download/${vers}/xmake-${vers}.${arch}.exe`
                : `https://github.com/xmake-io/xmake/releases/download/${vers}/xmake-${vers}.exe`;
            break;
        }
        default: {
            // check that we have tested all types
            const _: never = version.type;
            throw new Error('Unknown version type');
        }
    }
    // check if the URL returns 404. If so, xmake may have just released a
    // new version, causing some binaries to be temporarily unavailable, so
    // we need to fallback to the previous version.
    if (!_fallback) {
        const head = await fetch(finalUrl, { method: 'HEAD' });
        if (head.status === 404) {
            const currentVers = latestVers || vers;
            const previousVersion = (await selectVersion('<' + currentVers)) as GitVersion;
            core.warning(
                `The requested version ${currentVers} (${finalUrl}) resource is temporarily unavailable, trying to fallback to the previous version...`,
            );
            return await getInstallerUrl(previousVersion, true);
        }
    }
    return finalUrl;
}

async function installFromSource(xmakeBin: string, sourceDir: string, binDir: string): Promise<void> {
    await exec(xmakeBin, ['-y'], { cwd: sourceDir });
    await exec(xmakeBin, ['install', '-o', binDir, 'cli'], { cwd: sourceDir });
}

export async function winInstall(version: Version): Promise<void> {
    if (version.type === 'local') {
        throw new Error('Local builds for windows is not supported');
    }

    const actionsCacheFolder = core.getInput('actions-cache-folder');
    let actionsCacheKey = core.getInput('actions-cache-key');
    if (!actionsCacheKey) {
        actionsCacheKey = '';
    }

    const ver = version.version;
    const sha = version.sha;
    const platformIdentifier = await getPlatformIdentifier();
    const cacheKey = `xmake-cache-${actionsCacheKey}-${ver}-${sha}-${platformIdentifier}`;

    let toolDir = '';
    if (actionsCacheFolder && process.env.GITHUB_WORKSPACE) {
        const fullCachePath = path.resolve(process.env.GITHUB_WORKSPACE, actionsCacheFolder);
        try {
            try {
                fs.accessSync(path.join(fullCachePath, 'xmake.exe'), fs.constants.X_OK);
            } catch {
                await cache.restoreCache([actionsCacheFolder], cacheKey);
            }
            fs.accessSync(path.join(fullCachePath, 'xmake.exe'), fs.constants.X_OK);
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
        const installer = await core.group(`download xmake ${String(version)}`, async () => {
            const url = await getInstallerUrl(version);
            core.info(`downloading from ${url}`);
            const file = await toolCache.downloadTool(url);
            const exe = path.format({
                ...path.parse(file),
                ext: '.exe',
                base: undefined,
            });
            await io.mv(file, exe);
            core.info(`downloaded to ${exe}`);
            return exe;
        });
        toolDir = await core.group(`install xmake ${String(version)}`, async () => {
            const binDir = path.join(os.tmpdir(), `xmake-${version.sha}`);
            core.info(`installing to ${binDir}`);
            await exec(`"${installer}" /NOADMIN /S /D=${binDir}`);
            core.info(`installed to ${binDir}`);
            const cacheDir = await toolCache.cacheDir(binDir, 'xmake', ver);
            await io.rmRF(binDir);
            await io.rmRF(installer);
            return cacheDir;
        });
        await exec(`"${toolDir}/xmake.exe" --version`);
        if (version.type === 'heads') {
            const sourceDir = await core.group(`download xmake source ${String(version)}`, () =>
                git.create(version.repo, version.sha),
            );
            toolDir = await core.group(`install xmake source ${String(version)}`, async () => {
                const binDir = path.join(os.tmpdir(), `xmake-${version.sha}`);
                await installFromSource(`${toolDir}/xmake.exe`, `${sourceDir}/core`, binDir);
                const cacheDir = await toolCache.cacheDir(binDir, 'xmake', ver);

                await io.rmRF(binDir);
                await git.cleanup(version.sha);
                return cacheDir;
            });
        }

        if (toolDir) {
            let cacheDir = '';
            if (actionsCacheFolder && process.env.GITHUB_WORKSPACE) {
                cacheDir = path.resolve(process.env.GITHUB_WORKSPACE, actionsCacheFolder);
                await io.cp(toolDir, cacheDir, {
                    recursive: true,
                });
                await cache.saveCache([actionsCacheFolder], cacheKey);
                toolDir = cacheDir;
            }
        }
    }
    core.addPath(toolDir);
}
