import * as core from "@actions/core";
import * as semver from "semver";
import { downloadTool } from "@actions/tool-cache";
import * as _fs from "fs";
const fs = _fs.promises;

type TagItem = {
  ref: string;
  node_id: string;
  url: string;
  object: {
    sha: string;
    type: string;
    url: string;
  };
};

export async function fetchVersions() {
  const file = await downloadTool("https://api.github.com/repos/xmake-io/xmake/git/refs/tags");
  const tags: [TagItem] = JSON.parse(await fs.readFile(file, { encoding: "utf-8" }));
  return tags.map(({ ref, object: {sha} }) => [ref.slice(11), sha]).reduce(
    (o, [k, v]) => {
      o[k] = v;
      return o;
    },
    {} as Record<string, string>
  );
}

export async function selectVersion(version?: string) {
  version = version || core.getInput("xmake-version") || "latest";
  if (version.toLowerCase() === "latest") version = "";
  version = semver.validRange(version);
  if (!version) {
    throw new Error(
      `Invalid input xmake-version: ${core.getInput("xmake-version")}`
    );
  }

  const versions = await fetchVersions();
  const ver = semver.maxSatisfying(Object.keys(versions), version);
  if (!ver) {
    throw new Error(
      `No matched releases of xmake-version: ${version}`
    );
  }

  const sha = versions[ver];
  core.info(`selected xmake v${ver} (commit: ${sha.substr(0, 8)})`);
  return { version: ver, sha };
}
