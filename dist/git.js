"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
const io = require("@actions/io");
const os = require("os");
const path = require("path");
function makeOpt(ref) {
    return { cwd: path.join(os.tmpdir(), `xmake-${ref}`) };
}
async function lsRemote() {
    let out = '';
    await exec_1.exec('git', ['ls-remote', '--tags', 'https://github.com/xmake-io/xmake.git'], {
        silent: true,
        listeners: {
            stdout: d => (out += d.toString()),
        },
    });
    const data = {};
    out.split('\n').forEach(line => {
        const [ref, tag] = line.trim().split('\t');
        if (ref && tag && tag.startsWith('refs/tags/v')) {
            data[tag.substring('refs/tags/v'.length)] = ref;
        }
    });
    return data;
}
exports.lsRemote = lsRemote;
async function create(ref) {
    const opt = makeOpt(ref);
    await io.rmRF(opt.cwd);
    await io.mkdirP(opt.cwd);
    await exec_1.exec('git', ['init'], opt);
    await exec_1.exec('git', ['remote', 'add', 'origin', 'https://github.com/xmake-io/xmake.git'], opt);
    await exec_1.exec('git', ['fetch'], opt);
    await exec_1.exec('git', ['checkout', ref], opt);
    await exec_1.exec('git', ['submodule', 'update', '--init', '--recursive'], opt);
    return opt.cwd;
}
exports.create = create;
async function cleanup(ref) {
    const opt = makeOpt(ref);
    await io.rmRF(opt.cwd);
}
exports.cleanup = cleanup;
