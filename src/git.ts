import { exec } from '@actions/exec'
import * as io from '@actions/io'
import * as os from 'os'
import * as path from 'path'

export const folder = path.join(os.tmpdir(), `xmake${Date.now()}`)
const opt = { cwd: folder }

export async function create(ref: string) {
    await io.rmRF(folder)
    await io.mkdirP(folder)
    await exec('git', ['init'], opt)
    await exec('git', ['remote', 'add', 'origin', 'https://github.com/xmake-io/xmake.git'], opt)
    await exec('git', ['fetch'], opt)
    await exec('git', ['checkout', ref], opt)
    await exec('git', ['submodule', 'update', '--init', '--recursive'], opt)
    return folder
}

export async function cleanup() {
    await io.rmRF(folder)
}