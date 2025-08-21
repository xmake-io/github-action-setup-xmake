import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as os from 'os';

export async function getPlatformIdentifier(): Promise<string> {
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
