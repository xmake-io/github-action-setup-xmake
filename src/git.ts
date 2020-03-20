import { exec } from '@actions/exec';
import * as io from '@actions/io';
import * as os from 'os';
import * as path from 'path';

function makeOpt(ref: string): { cwd: string } {
    return { cwd: path.join(os.tmpdir(), `xmake-${ref}`) };
}

export async function lsRemote(): Promise<Record<string, string>> {
    let out = '';
    await exec('git', ['ls-remote', '--tags', 'https://github.com/xmake-io/xmake.git'], {
        silent: true,
        listeners: {
            stdout: d => (out += d.toString()),
        },
    });
    const data: Record<string, string> = {};
    out.split('\n').forEach(line => {
        const [ref, tag] = line.trim().split('\t');
        if (ref && tag && tag.startsWith('refs/tags/v')) {
            data[tag.substring('refs/tags/v'.length)] = ref;
        }
    });
    return data;
}

export async function create(ref: string): Promise<string> {
    const opt = makeOpt(ref);
    await io.rmRF(opt.cwd);
    await io.mkdirP(opt.cwd);
    await exec('git', ['init'], opt);
    await exec('git', ['remote', 'add', 'origin', 'https://github.com/xmake-io/xmake.git'], opt);
    await exec('git', ['fetch'], opt);
    await exec('git', ['checkout', ref], opt);
    await exec('git', ['submodule', 'update', '--init', '--recursive'], opt);
    return opt.cwd;
}

export async function cleanup(ref: string): Promise<void> {
    const opt = makeOpt(ref);
    await io.rmRF(opt.cwd);
}
