"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repo = exports.Sha = void 0;
function Sha(sha) {
    sha = sha.trim().toLowerCase();
    if (!/^[a-f0-9]{40}$/g.test(sha))
        throw new Error(`Invalid sha value ${sha}`);
    return sha;
}
exports.Sha = Sha;
function Repo(repo) {
    repo = repo.trim();
    if (!/^([^/#]+\/[^/#]+)$/g.test(repo))
        throw new Error(`Invalid repo value ${repo}`);
    return repo;
}
exports.Repo = Repo;
