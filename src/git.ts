import { exec } from '@actions/exec';
import * as io from '@actions/io';
import * as os from 'os';
import * as path from 'path';
import { Sha, RefDic, Repo } from './interfaces';
import { valid as isValidSemver } from 'semver';

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
        const [ref, path] = line.trim().split('\t') as [Sha, string];
        if (ref && path?.startsWith('refs/')) {
            const tagPath = path.split('/').splice(1);
            switch (tagPath[0]) {
                case 'heads': {
                    // refs/heads/copilot/fix-6807
                    const head = tagPath.slice(1).join('/');
                    data.heads[head] = ref;
                    break;
                }
                case 'pull': {
                    // refs/pull/11/head
                    // refs/pull/11/merge
                    const pr = Number(tagPath[1]);
                    if (!data.pull[pr]) {
                        data.pull[pr] = {} as RefDic['pull'][number];
                    }
                    data.pull[pr][tagPath[2] as 'head' | 'merge'] = ref;
                    break;
                }
                case 'tags': {
                    // refs/tags/preview
                    // refs/tags/v3.0.3
                    const tag = tagPath.slice(1).join('/');
                    if (isValidSemver(tag)) {
                        data.tags[tag] = ref;
                    }
                    break;
                }
                default:
                    break;
            }
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
    await exec(
        'git',
        ['fetch', 'origin', '+refs/pull/*:refs/remotes/origin/pull/*', '+refs/heads/*:refs/remotes/origin/*'],
        opt,
    );
    await exec('git', ['checkout', ref], opt);
    await exec('git', ['submodule', 'update', '--init', '--recursive'], opt);
    return opt.cwd;
}

export async function cleanup(ref: Sha): Promise<void> {
    const opt = makeOpt(ref);
    await io.rmRF(opt.cwd);
}
