const core = require('@actions/core')
const { exec, execSync } = require('child_process')
const fetch = require('node-fetch')
const fs = require('fs')

async function run() {
    try {
        const version = core.getInput('xmake-version')

        const data = fetch('https://raw.githubusercontent.com/tboox/xmake/master/scripts/get.sh')
        await fs.promises.mkdir('/tmp/xmake')
        await fs.promises.writeFile(`/tmp/xmake/get.sh`, await (await data).buffer())
        execSync(`bash /tmp/xmake/get.sh`)

        core.addPath("/home/runner/.local/bin")
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()