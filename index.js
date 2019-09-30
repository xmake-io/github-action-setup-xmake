import * as core from '@actions/core';
import * as path from 'path';
import { exec, execSync } from 'child_process';

async function run() {
    try {
        const version = core.getInput('xmake-version');

        execSync("bash <(curl -fsSL https://raw.githubusercontent.com/tboox/xmake/master/scripts/get.sh)")

        core.addPath("/home/runner/.local/bin");
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();