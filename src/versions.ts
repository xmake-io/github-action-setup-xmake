import * as core from '@actions/core'
import * as semver from 'semver'
import { downloadTool } from '@actions/tool-cache'
import * as _fs from 'fs'
const fs = _fs.promises

type VersionMap = { [v: string]: string }

export async function fetchVersions() {
    const file = await downloadTool('https://raw.githubusercontent.com/xmake-io/github-action-setup-xmake/data/versions.json')
    const versions = await fs.readFile(file, 'utf-8')
    return JSON.parse(versions) as VersionMap
}

export async function selectVersion(version?: string) {
    version = version || core.getInput('xmake-version') || 'latest'
    if (version.toLowerCase() === 'latest') version = ''
    version = semver.validRange(version)
    if (!version) throw new Error(`Invalid input xmake-version: ${core.getInput('xmake-version')}`)

    const versions = await fetchVersions()
    const ver = semver.maxSatisfying(Object.keys(versions), version)
    if (!ver) throw new Error(`No matched releases of xmake-version: ${version}`)

    const sha = versions[ver]
    core.info(`selected xmake v${ver} (commit: ${sha.substr(0, 8)})`)
    return { version: ver, sha }
}