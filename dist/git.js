"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = exports.create = exports.lsRemote = void 0;
const exec_1 = require("@actions/exec");
const io = __importStar(require("@actions/io"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
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
