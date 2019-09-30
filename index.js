const core = require('@actions/core')
const os = require('os')
const path = require('path')
const child_process = require('child_process')
const fetch = require('node-fetch')
const fs = require('fs')
const git = require('simple-git/promise')
const semver = require('semver')
const octokit = require('@octokit/rest')

const xmakeRepo = { owner: 'xmake-io', repo: 'xmake' }

async function fetchVersions() {
    const api = new octokit()
    const tags = await api.repos.listTags({ ...xmakeRepo, per_page: 100 })
    /**
     * @type {Object.<string, string>}
     */
    const versions = {}
    tags.data.forEach(tag => {
        const ver = semver.valid(tag.name)
        if (ver) {
            versions[ver] = tag.commit.sha
        }
    })
    return versions
}

async function download(sha) {
    const folder = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'xmake'))
    console.log(folder)
    const repo = git(folder)
    await repo.init()
    await repo.addRemote('origin', 'https://github.com/xmake-io/xmake.git');
    await repo.fetch()
    await repo.checkout(sha)
    await repo.submoduleUpdate(['--init', '--recursive'])
    return folder
}

async function getSha() {
    let version = core.getInput('xmake-version') || 'latest'
    if (version.toLowerCase() === 'latest') version = ''
    version = semver.validRange(version)
    if (!version) throw new Error(`Invalid input xmake-version: ${core.getInput('xmake-version')}`)

    const versions = await fetchVersions()
    const ver = semver.maxSatisfying(Object.keys(versions), version)
    if (!ver) throw new Error(`No matched releases of xmake-version: ${version}`)
    return versions[ver]
}

function exec(command) {
    return new Promise((resolve, reject) =>
        child_process.exec(command, {}, (error, stdout, stderr) => {
            if (error) reject(error)
            resolve({ stdout, stderr })
        })
    )
}

async function run() {
    try {
        const folder = await core.group("download xmake", async () => await download(await getSha()))
        await core.group("install xmake", async () => {
            await exec(`make -C ${folder} build`)
            await exec(`make -C ${folder} install prefix=/home/runner/.local`)
        })
        core.addPath("/home/runner/.local/bin")
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()