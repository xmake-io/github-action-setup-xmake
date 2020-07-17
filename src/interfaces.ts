import { Opaque } from 'type-fest';

export type Sha = Opaque<string, 'sha'>;
export function Sha(sha: string): Sha {
    sha = sha.trim().toLowerCase();
    if (!/^[a-f0-9]{40}$/g.test(sha)) throw new Error(`Invalid sha value ${sha}`);
    return sha as Sha;
}

export type Repo = Opaque<string, 'repo'>;
export function Repo(repo: string): Repo {
    repo = repo.trim();
    if (!/^([^/#]+\/[^/#]+)$/g.test(repo)) throw new Error(`Invalid repo value ${repo}`);
    return repo as Repo;
}

export type RefDic = {
    /** branches */
    heads: Record<string, Sha>;
    /** tags */
    tags: Record<string, Sha>;
    /** pull requests */
    pull: Record<
        number,
        {
            /** the current state of the pull request */
            head: Sha;
            /** the current branch we're merging onto */
            base?: Sha;
            /** merge result */
            merge?: Sha;
        }
    >;
};

export interface GitVersion {
    version: string;
    sha: Sha;
    type: keyof RefDic | 'sha';
    repo: Repo;
}

export interface LocalVersion {
    type: 'local';
    path: string;
    version: undefined;
}

export type Version = GitVersion | LocalVersion;
