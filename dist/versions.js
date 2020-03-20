"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const semver = require("semver");
const _fs = require("fs");
const fs = _fs.promises;
async function fetchVersions() {
    const tags = await (await fetch("https://api.github.com/repos/xmake-io/xmake/git/refs/tags")).json();
    return tags.map(({ ref, object: { sha } }) => [ref.slice(11), sha]).reduce((o, [k, v]) => {
        o[k] = v;
        return o;
    }, {});
}
exports.fetchVersions = fetchVersions;
async function selectVersion(version) {
    version = version || core.getInput("xmake-version") || "latest";
    if (version.toLowerCase() === "latest")
        version = "";
    version = semver.validRange(version);
    if (!version) {
        throw new Error(`Invalid input xmake-version: ${core.getInput("xmake-version")}`);
    }
    const versions = await fetchVersions();
    const ver = semver.maxSatisfying(Object.keys(versions), version);
    if (!ver) {
        throw new Error(`No matched releases of xmake-version: ${version}`);
    }
    const sha = versions[ver];
    core.info(`selected xmake v${ver} (commit: ${sha.substr(0, 8)})`);
    return { version: ver, sha };
}
exports.selectVersion = selectVersion;
