import { exec } from '@actions/exec';
import * as io from '@actions/io';
import * as os from 'os';
import * as path from 'path';
import { Sha, RefDic } from './interfaces';

function makeOpt(ref: Sha): { cwd: string } {
    return { cwd: path.join(os.tmpdir(), `xmake-git-${ref}`) };
}

export async function lsRemote(): Promise<RefDic> {
    let out = '';
    await exec('git', ['ls-remote', 'https://github.com/xmake-io/xmake.git'], {
        silent: true,
        listeners: {
            stdout: (d) => (out += d.toString()),
        },
    });
    const data: RefDic = { heads: {}, tags: {}, pull: {} };
    out.split('\n').forEach((line) => {
        const [ref, tag] = line.trim().split('\t');
        if (ref && tag && tag.startsWith('refs/')) {
            const tagPath = tag.split('/').splice(1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let ldata = data as any;
            for (let i = 0; i < tagPath.length - 1; i++) {
                const seg = tagPath[i];
                if (typeof ldata[seg] === 'object') {
                    ldata = ldata[seg];
                } else {
                    ldata = ldata[seg] = {};
                }
            }
            ldata[tagPath[tagPath.length - 1]] = ref;
        }
    });
    return data;
}

export async function create(ref: Sha): Promise<string> {
    const opt = makeOpt(ref);
    await io.rmRF(opt.cwd);
    await io.mkdirP(opt.cwd);
    await exec('git', ['init'], opt);
    await exec('git', ['remote', 'add', 'origin', 'https://github.com/xmake-io/xmake.git'], opt);
    await exec('git', ['fetch', 'origin', '+refs/pull/*:refs/remotes/origin/pull/*', '+refs/heads/*:refs/remotes/origin/*'], opt);
    await exec('git', ['checkout', ref], opt);
    await exec('git', ['submodule', 'update', '--init', '--recursive'], opt);
    return opt.cwd;
}

export async function cleanup(ref: Sha): Promise<void> {
    const opt = makeOpt(ref);
    await io.rmRF(opt.cwd);
}
