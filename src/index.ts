import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as io from '@actions/io';
import * as toolCache from '@actions/tool-cache';
import * as os from 'os';
import * as path from 'path';
import * as semver from 'semver';
import * as git from './git';
import { selectVersion } from './versions';

async function winInstall(version: string): Promise<void> {
    let toolDir = toolCache.find('xmake', version);
    if (!toolDir) {
        const installer = await core.group('download xmake', async () => {
            const arch = os.arch() === 'x64' ? 'x64' : 'x86';
            const url = semver.gt(version, '2.2.6')
                ? `https://ci.appveyor.com/api/projects/waruqi/xmake/artifacts/xmake-installer.exe?tag=v${version}&pr=false&job=Image%3A+Visual+Studio+2017%3B+Platform%3A+${arch}`
                : `https://github.com/xmake-io/xmake/releases/download/v$v/xmake-v${version}.exe`;
            core.info(`downloading from ${url}`);
            const file = await toolCache.downloadTool(url);
            const exe = path.format({ ...path.parse(file), ext: '.exe', base: undefined });
            await io.mv(file, exe);
            core.info(`downloaded to ${exe}`);
            return exe;
        });
        toolDir = await core.group('install xmake', async () => {
            const binDir = path.join(os.tmpdir(), `xmake-${version}`);
            core.info(`installing to ${binDir}`);
            await exec(`"${installer}" /NOADMIN /S /D=${binDir}`);
            core.info(`installed to ${binDir}`);
            const cacheDir = await toolCache.cacheDir(binDir, 'xmake', version);
            await io.rmRF(binDir);
            await io.rmRF(installer);
            return cacheDir;
        });
    }
    core.addPath(toolDir);
}

async function unixInstall(version: string, sha: string): Promise<void> {
    let toolDir = toolCache.find('xmake', version);
    if (!toolDir) {
        const sourceDir = await core.group('download xmake', () => git.create(sha));
        toolDir = await core.group('install xmake', async () => {
            await exec('make', ['build'], { cwd: sourceDir });
            const binDir = path.join(os.tmpdir(), `xmake-${version}-${sha}`);
            await exec('make', ['install', `prefix=${binDir}`], { cwd: sourceDir });
            const cacheDir = await toolCache.cacheDir(binDir, 'xmake', version);
            await io.rmRF(binDir);
            await git.cleanup(sha);
            return cacheDir;
        });
    }
    core.addPath(path.join(toolDir, 'share', 'xmake'));
}

async function run(): Promise<void> {
    try {
        const { version, sha } = await selectVersion();
        if (os.platform() === 'win32' || os.platform() === 'cygwin') await winInstall(version);
        else await unixInstall(version, sha);
        await exec('xmake --version');
    } catch (error) {
        core.setFailed(error.message);
    }
}

run().catch(e => core.error(e));
