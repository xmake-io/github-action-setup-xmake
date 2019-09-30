const exec = require('@actions/exec').exec
const io = require('@actions/io')
const os = require('os')
const path = require('path')

const folder = path.join(os.tmpdir(), `xmake${Date.now()}`)
const opt = { cwd: folder }

module.exports.folder = folder

module.exports.create = async function (ref) {
    await io.rmRF(folder)
    await io.mkdirP(folder)
    await exec('git', ['init'], opt)
    await exec('git', ['remote', 'add', 'origin', 'https://github.com/xmake-io/xmake.git'], opt)
    await exec('git', ['fetch'], opt)
    await exec('git', ['checkout', ref], opt)
    await exec('git', ['submodule', 'update', '--init', '--recursive'], opt)
    return folder
}

module.exports.cleanup = async function () {
    await io.rmRF(folder)
}