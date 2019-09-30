const core = require('@actions/core')
const exec = require('@actions/exec').exec
const fs = require('fs').promises
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

async function download(sha) {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'xmake'))
    await exec('git', ['init'])
    await exec('git', ['remote', 'add', 'origin', 'https://github.com/xmake-io/xmake.git'])
    await exec('git', ['fetch'])
    await exec('git', ['checkout', sha])
    await exec('git', ['submodule', 'update', '--init', '--recursive'])
    return folder
}

async function selectVersion() {
    let version = core.getInput('xmake-version') || 'latest'
    if (version.toLowerCase() === 'latest') version = ''
    version = semver.validRange(version)
    if (!version) throw new Error(`Invalid input xmake-version: ${core.getInput('xmake-version')}`)

    const versions = await fetchVersions()
    const ver = semver.maxSatisfying(Object.keys(versions), version)
    if (!ver) throw new Error(`No matched releases of xmake-version: ${version}`)

    core.info(`Selected xmake ${ver}`)
    core.debug(`SHA: ${versions[ver]}`)
    return { version, sha: versions[ver] }
}

async function run() {
    try {
        let version = ''
        let sha = ''
        const folder = await core.group("download xmake", async () => {
            const v = await selectVersion()
            version = v.version
            sha = v.sha
            return await download(sha)
        })
        await core.group("install xmake", async () => {
            let toolDir = toolCache.find('xmake', version)
            if (!toolDir) {
                await exec('make', ['build'], { cwd: folder })
                const prefix = path.join(os.tmpdir(), `xmake-${version}-${sha}`)
                await exec('make', ['install', `prefix=${prefix}`], { cwd: folder })
                toolDir = await toolCache.cacheDir(prefix, 'xmake', version)
            }
            core.addPath(path.join(toolDir, 'bin'))
        })
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()