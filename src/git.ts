import { exec } from '@actions/exec';
import * as io from '@actions/io';
import * as os from 'os';
import * as path from 'path';
import { Sha, RefDic, Repo } from './interfaces';

function makeOpt(ref: Sha): { cwd: string } {
    return { cwd: path.join(os.tmpdir(), `xmake-git-${ref}`) };
}

const repoUrl = (repo: Repo): string => `https://github.com/${repo}.git`;

export async function lsRemote(repo: Repo): Promise<RefDic> {
    let out = '';
    await exec('git', ['ls-remote', repoUrl(repo)], {
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
            let ldata = data as any; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            for (let i = 0; i < tagPath.length - 1; i++) {
                const seg = tagPath[i];
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (typeof ldata[seg] === 'object') {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    ldata = ldata[seg]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    ldata = ldata[seg] = {};
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            ldata[tagPath[tagPath.length - 1]] = ref;
        }
    });
    return data;
}

export async function create(repo: Repo, ref: Sha): Promise<string> {
    const opt = makeOpt(ref);
    await io.rmRF(opt.cwd);
    await io.mkdirP(opt.cwd);
    await exec('git', ['init'], opt);
    await exec('git', ['remote', 'add', 'origin', repoUrl(repo)], opt);
    await exec('git', ['fetch', 'origin', '+refs/pull/*:refs/remotes/origin/pull/*', '+refs/heads/*:refs/remotes/origin/*'], opt);
    await exec('git', ['checkout', ref], opt);
    await exec('git', ['submodule', 'update', '--init', '--recursive'], opt);
    return opt.cwd;
}

export async function cleanup(ref: Sha): Promise<void> {
    const opt = makeOpt(ref);
    await io.rmRF(opt.cwd);
}
