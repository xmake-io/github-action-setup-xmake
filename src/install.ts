import { exec } from '@actions/exec';
import * as os from 'os';
import { selectVersion } from './versions';
import { winInstall } from './win-install';
import { unixInstall } from './unix-install';

export async function installXmake(): Promise<void> {
    const version = await selectVersion();
    if (os.platform() === 'win32' || os.platform() === 'cygwin') {
        await winInstall(version);
    } else {
        await unixInstall(version);
    }
    await exec('xmake --root --version');
}
