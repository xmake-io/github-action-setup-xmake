import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as io from '@actions/io';
import * as toolCache from '@actions/tool-cache';
import * as os from 'os';
import * as path from 'path';
import * as semver from 'semver';
import { Version } from './versions';

function getInstallerUrl(version: Version): string {
    const ver = version.version;
    if (version.type === 'heads') {
        // we only use appveyor ci artifacts for branch version
        const arch = os.arch() === 'x64' ? 'x64' : 'x86';
        return `https://ci.appveyor.com/api/projects/waruqi/xmake/artifacts/xmake-installer.exe?branch=${ver}&pr=false&job=Image%3A+Visual+Studio+2017%3B+Platform%3A+${arch}`;
    } else if (version.type === 'pull') {
        throw new Error('PR builds for windows is not supported');
    } else {
        // we cannot use appveyor ci artifacts, the old version links may be broken.
        const arch = os.arch() === 'x64' ? 'win64' : 'win32';
        return semver.gt(ver, '2.2.6')
            ? `https://github.com/xmake-io/xmake/releases/download/${ver}/xmake-${ver}.${arch}.exe`
            : `https://github.com/xmake-io/xmake/releases/download/${ver}/xmake-${ver}.exe`;
    }
}

export async function winInstall(version: Version): Promise<void> {
    const ver = version.version;
    let toolDir = toolCache.find('xmake', ver);
    if (!toolDir) {
        const installer = await core.group(`download xmake ${version}`, async () => {
            const url = getInstallerUrl(version);
            core.info(`downloading from ${url}`);
            const file = await toolCache.downloadTool(url);
            const exe = path.format({ ...path.parse(file), ext: '.exe', base: undefined });
            await io.mv(file, exe);
            core.info(`downloaded to ${exe}`);
            return exe;
        });
        toolDir = await core.group(`install xmake ${version}`, async () => {
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
