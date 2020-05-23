"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Sha(sha) {
    sha = sha.trim().toLowerCase();
    if (!/^[a-f0-9]{40}$/g.test(sha))
        throw new Error(`Invalid sha value ${sha}`);
    return sha;
}
exports.Sha = Sha;
