const core = require('@actions/core')
const exec = require('@actions/exec').exec
const fs = require('fs').promises
const io = require('@actions/io')
const toolCache = require('@actions/tool-cache')
const os = require('os')
const path = require('path')
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
        const ver = semver.clean(tag.name)
        if (ver) {
            versions[ver] = tag.commit.sha
        }
    })
    return versions
}

async function selectVersion() {
    let version = core.getInput('xmake-version') || 'latest'
    if (version.toLowerCase() === 'latest') version = ''
    version = semver.validRange(version)
    if (!version) throw new Error(`Invalid input xmake-version: ${core.getInput('xmake-version')}`)

    const versions = await fetchVersions()
    const ver = semver.maxSatisfying(Object.keys(versions), version)
    if (!ver) throw new Error(`No matched releases of xmake-version: ${version}`)

    const sha = versions[ver]
    core.info(`Selected xmake ${ver} (commit: ${sha.substr(0, 8)})`)
    return { version: ver, sha }
}

async function download(sha) {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'xmake'))
    const opt = { cwd: folder }
    await exec('git', ['init'], opt)
    await exec('git', ['remote', 'add', 'origin', 'https://github.com/xmake-io/xmake.git'], opt)
    await exec('git', ['fetch'], opt)
    await exec('git', ['checkout', sha], opt)
    await exec('git', ['submodule', 'update', '--init', '--recursive'], opt)
    return folder
}

async function run() {
    try {
        const { version, sha } = await selectVersion()
        let toolDir = toolCache.find('xmake', version)
        if (!toolDir) {
            const sourceDir = await core.group("download xmake", () => download(sha))
            toolDir = await core.group("install xmake", async () => {
                await exec('make', ['build'], { cwd: sourceDir })
                const binDir = path.join(os.tmpdir(), `xmake-${version}-${sha}`)
                await exec('make', ['install', `prefix=${binDir}`], { cwd: sourceDir })
                const cacheDir = await toolCache.cacheDir(binDir, 'xmake', version)
                await io.rmRF(binDir)
                await io.rmRF(sourceDir)
                return cacheDir
            })
        }
        core.addPath(path.join(toolDir, 'share', 'xmake'))
        await exec('xmake --version')
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()