#!/usr/bin/env node
// Watches the repository's open pull requests and tells canary-red in the Switch room when one
// is opened or gets new commits. Runs on the same machine as the Switch server, so it needs no
// public address: it reads GitHub with `gh` and posts with POST /agents/{agent_id}/message.
//
//   node agents/tools/pr-watcher.mjs --dry-run --once     # print what it would post, then exit
//   node agents/tools/pr-watcher.mjs                       # post for real, every 30 seconds
//
// Settings (environment or ~/canary-agents/.env.watcher):
//   SWITCH_ROOM_ID        the room to post in (required unless --dry-run)
//   SWITCH_CREDENTIALS    agent credentials file written by Switch Console
//                         (default: ~/canary-agents/canary-blue/.switch/agents/canary-blue.json)
//   GITHUB_REPO           owner/name (default: adeyanjufuhad/canary)
//   POLL_SECONDS          default 30
//
// The first poll only records the PRs already open; pass --announce-existing to post them too.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const dryRun = flag("dry-run");
const once = flag("once");

const agentsHome = join(homedir(), "canary-agents");
const envFile = join(agentsHome, ".env.watcher");
if (existsSync(envFile)) process.loadEnvFile(envFile);

const repo = process.env.GITHUB_REPO ?? "adeyanjufuhad/canary";
const pollSeconds = Number(process.env.POLL_SECONDS ?? 30);
const stateFile = join(agentsHome, ".pr-watcher-state.json");
const credentialsFile =
  process.env.SWITCH_CREDENTIALS ?? join(agentsHome, "canary-blue", ".switch", "agents", "canary-blue.json");

const stamp = () => new Date().toISOString().slice(11, 19) + " UTC";
const log = (message) => console.log(`[${stamp()}] ${message}`);

function switchSettings() {
  if (!existsSync(credentialsFile)) {
    throw new Error(`No Switch credentials at ${credentialsFile}. Create canary-blue in Switch Console first.`);
  }
  const creds = JSON.parse(readFileSync(credentialsFile, "utf8"));
  const endpoint = creds.SWITCH_API_ENDPOINT;
  const token = creds.SWITCH_API_TOKEN;
  const agentId = creds.SWITCH_AGENT_ID;
  const roomId = process.env.SWITCH_ROOM_ID;
  if (!endpoint || !token || !agentId) throw new Error(`${credentialsFile} is missing SWITCH_API_ENDPOINT, SWITCH_API_TOKEN or SWITCH_AGENT_ID.`);
  if (!roomId) throw new Error("SWITCH_ROOM_ID is not set.");
  return { endpoint: endpoint.replace(/\/$/, ""), token, agentId, roomId };
}

function openPullRequests() {
  const res = spawnSync("gh", ["api", `repos/${repo}/pulls?state=open&per_page=50`], { encoding: "utf8" });
  if (res.status !== 0) throw new Error(`gh api failed: ${res.stderr.trim()}`);
  return JSON.parse(res.stdout).map((pr) => ({
    number: pr.number,
    title: pr.title,
    author: pr.user?.login ?? "unknown",
    sha: pr.head.sha,
    url: pr.html_url,
    draft: pr.draft,
  }));
}

async function post(content, settings) {
  if (dryRun) return log(`would post: ${content}`);
  const res = await fetch(`${settings.endpoint}/agents/${settings.agentId}/message`, {
    method: "POST",
    headers: { Authorization: `Bearer ${settings.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ room_id: settings.roomId, content }),
  });
  if (!res.ok) throw new Error(`Switch answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
  log(`posted: ${content}`);
}

const settings = dryRun ? null : switchSettings();
let seen = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : null;
const firstRun = seen === null;
seen ??= {};

log(`watching ${repo} every ${pollSeconds}s${dryRun ? " (dry run)" : ""}`);

while (true) {
  try {
    const prs = openPullRequests();
    for (const pr of prs) {
      if (pr.draft) continue;
      const before = seen[pr.number];
      if (before === pr.sha) continue;
      seen[pr.number] = pr.sha;
      if (firstRun && before === undefined && !flag("announce-existing")) {
        log(`already open, not announced: PR #${pr.number} (${pr.sha.slice(0, 7)})`);
        continue;
      }
      const head = pr.sha.slice(0, 7);
      const content =
        before === undefined
          ? `@canary-red PR #${pr.number} opened: ${pr.title} by ${pr.author} (${pr.url}, head ${head})`
          : `@canary-red PR #${pr.number} updated: new head ${head} (${pr.url})`;
      await post(content, settings);
    }
    const open = new Set(prs.map((pr) => String(pr.number)));
    for (const number of Object.keys(seen)) if (!open.has(number)) delete seen[number];
    if (!dryRun) writeFileSync(stateFile, JSON.stringify(seen, null, 2));
  } catch (error) {
    log(`error: ${error.message}`);
  }
  if (once) break;
  await new Promise((r) => setTimeout(r, pollSeconds * 1000));
}
