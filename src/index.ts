import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as os from 'os';
import { selectVersion } from './versions';
import { winInstall } from './win-install';
import { unixInstall } from './unix-install';

async function run(): Promise<void> {
    try {
        const version = await selectVersion();
        if (os.platform() === 'win32' || os.platform() === 'cygwin') await winInstall(version);
        else await unixInstall(version);
        await exec('xmake --version');
    } catch (error) {
        core.setFailed(error.message);
    }
}

run().catch((e) => core.error(e));
