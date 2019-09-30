const core = require('@actions/core')
const { exec, execSync } = require('child_process')

async function run() {
    try {
        const version = core.getInput('xmake-version')

        execSync("bash <(curl -fsSL https://raw.githubusercontent.com/tboox/xmake/master/scripts/get.sh)")

        core.addPath("/home/runner/.local/bin")
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()