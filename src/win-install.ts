import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as io from '@actions/io';
import * as toolCache from '@actions/tool-cache';
import * as os from 'os';
import * as path from 'path';
import * as semver from 'semver';
import { Version, GitVersion } from './interfaces';

function getInstallerUrl(version: GitVersion, latest: GitVersion): string {
    const ver = version.version;
    switch (version.type) {
        case 'heads': {
            const arch = os.arch() === 'x64' ? 'win64' : 'win32';
            const latestver = latest.version;
            return `https://github.com/xmake-io/xmake/releases/download/${latestver}/xmake-${ver}.${arch}.exe`;
        }
        case 'pull': {
            throw new Error('PR builds for windows is not supported');
        }
        case 'sha': {
            throw new Error('Sha builds for windows is not supported');
        }
        case 'tags': {
            const arch = os.arch() === 'x64' ? 'win64' : 'win32';
            return semver.gt(ver, '2.2.6')
                ? `https://github.com/xmake-io/xmake/releases/download/${ver}/xmake-${ver}.${arch}.exe`
                : `https://github.com/xmake-io/xmake/releases/download/${ver}/xmake-${ver}.exe`;
        }
        default: {
            // check that we have tested all types
            const _: never = version.type;
            throw new Error('Unknown version type');
        }
    }
}

export async function winInstall(version: Version, latest: Version): Promise<void> {
    if (version.type === 'local' || latest.type === 'local') {
        throw new Error('Local builds for windows is not supported');
    }
    const ver = version.version;
    let toolDir = toolCache.find('xmake', ver);
    if (!toolDir) {
        const installer = await core.group(`download xmake ${String(version)}`, async () => {
            const url = getInstallerUrl(version, latest);
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
    }
    core.addPath(toolDir);
}
