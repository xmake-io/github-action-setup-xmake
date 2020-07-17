"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = exports.create = exports.lsRemote = void 0;
const exec_1 = require("@actions/exec");
const io = require("@actions/io");
const os = require("os");
const path = require("path");
function makeOpt(ref) {
    return { cwd: path.join(os.tmpdir(), `xmake-git-${ref}`) };
}
const repoUrl = (repo) => `https://github.com/${repo}.git`;
async function lsRemote(repo) {
    let out = '';
    await exec_1.exec('git', ['ls-remote', repoUrl(repo)], {
        silent: true,
        listeners: {
            stdout: (d) => (out += d.toString()),
        },
    });
    const data = { heads: {}, tags: {}, pull: {} };
    out.split('\n').forEach((line) => {
        const [ref, tag] = line.trim().split('\t');
        if (ref && tag && tag.startsWith('refs/')) {
            const tagPath = tag.split('/').splice(1);
            let ldata = data;
            for (let i = 0; i < tagPath.length - 1; i++) {
                const seg = tagPath[i];
                if (typeof ldata[seg] === 'object') {
                    ldata = ldata[seg];
                }
                else {
                    ldata = ldata[seg] = {};
                }
            }
            ldata[tagPath[tagPath.length - 1]] = ref;
        }
    });
    return data;
}
exports.lsRemote = lsRemote;
async function create(repo, ref) {
    const opt = makeOpt(ref);
    await io.rmRF(opt.cwd);
    await io.mkdirP(opt.cwd);
    await exec_1.exec('git', ['init'], opt);
    await exec_1.exec('git', ['remote', 'add', 'origin', repoUrl(repo)], opt);
    await exec_1.exec('git', ['fetch', 'origin', '+refs/pull/*:refs/remotes/origin/pull/*', '+refs/heads/*:refs/remotes/origin/*'], opt);
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
