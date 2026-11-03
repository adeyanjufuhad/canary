#!/usr/bin/env node
// Watches the repository's open pull requests and tells canary-red in the Switch room when one
// is opened or gets new commits. Runs on the same machine as the Switch server, so it needs no
// public address: it reads GitHub with `gh`, then posts in the room's Slack channel as you
// (SLACK_USER_TOKEN), or through Switch as its own agent, canary-watch.
//
//   node agents/tools/pr-watcher.mjs --test                # post one test message, then exit
//   node agents/tools/pr-watcher.mjs --dry-run --once     # print what it would post, then exit
//   node agents/tools/pr-watcher.mjs                       # post for real, every 30 seconds
//   node agents/tools/pr-watcher.mjs register              # Switch route only: register canary-watch once
//
// Settings (environment or ~/canary-agents/.env.watcher):
//   SLACK_USER_TOKEN         Slack route: your user token (xoxp-…) with the chat:write user scope
//   SLACK_CHANNEL_ID         Slack route: the room's channel id (C…)
//   SWITCH_REGISTRATION_KEY  Switch route, `register` only: a key from the Gateway's API Keys page
//   SWITCH_API_ENDPOINT      for `register` only; default: the local server Switch Console runs
//   SWITCH_ROOM_ID           the room to post in (required unless --dry-run)
//   SWITCH_CREDENTIALS       where `register` saves canary-watch's key (default: ~/canary-agents/.switch-watch.json)
//   GITHUB_REPO              owner/name (default: adeyanjufuhad/canary)
//   POLL_SECONDS             default 30
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
const credentialsFile = process.env.SWITCH_CREDENTIALS ?? join(agentsHome, ".switch-watch.json");

const stamp = () => new Date().toISOString().slice(11, 19) + " UTC";
const log = (message) => console.log(`[${stamp()}] ${message}`);

/** The local server's API address, from the ports file Switch Console writes on Windows. */
function localApiEndpoint() {
  if (process.env.SWITCH_API_ENDPOINT) return process.env.SWITCH_API_ENDPOINT.replace(/\/$/, "");
  const ports = join(process.env.APPDATA ?? "", "switchdash", "local-switch-server", "ports.json");
  if (!existsSync(ports)) throw new Error("Set SWITCH_API_ENDPOINT (the Switch server's API address).");
  return `http://localhost:${JSON.parse(readFileSync(ports, "utf8")).api}`;
}

/**
 * Registers the canary-watch agent once and saves its own API key, so the watcher never
 * borrows another agent's credentials. Switch returns the key only once.
 */
async function register() {
  const key = process.env.SWITCH_REGISTRATION_KEY;
  if (!key) throw new Error(`Put SWITCH_REGISTRATION_KEY in ${envFile} first.`);
  if (existsSync(credentialsFile)) throw new Error(`${credentialsFile} already exists; canary-watch is registered.`);
  const endpoint = localApiEndpoint();
  const res = await fetch(`${endpoint}/agents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "canary-watch",
      description: "Tells canary-red when a pull request is opened or updated.",
      connector_type: "canary-pr-watcher",
      integration_profile: {
        // it only posts; nothing can push messages to it
        connection_model: "session_passive",
        message_exchange: true,
        pre_invocation_mediation: [],
        post_invocation_mediation: [],
        event_reporting: [],
      },
    }),
  });
  if (!res.ok) throw new Error(`Switch answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const { id, api_key } = await res.json();
  writeFileSync(
    credentialsFile,
    JSON.stringify({ SWITCH_API_ENDPOINT: endpoint, SWITCH_AGENT_ID: id, SWITCH_API_TOKEN: api_key }, null, 2),
    { mode: 0o600 },
  );
  log(`registered canary-watch (${id}); key saved to ${credentialsFile}`);
  log("Next: invite it into the room with `!invite-agent @canary-watch`, then set SWITCH_ROOM_ID.");
}

if (args[0] === "register") {
  try {
    await register();
  } catch (error) {
    console.error(`register: ${error.message}`);
    process.exitCode = 1;
  }
  process.exit();
}

/**
 * Where messages go. With SLACK_USER_TOKEN set, the watcher posts in the room's Slack channel
 * as you, which Switch already treats as the agents' owner. This is the route for a local server
 * without Docker, which has no Gateway to create registration keys. Otherwise it posts through
 * Switch as the registered canary-watch agent.
 */
function transport() {
  if (process.env.SLACK_USER_TOKEN) {
    const channel = process.env.SLACK_CHANNEL_ID;
    if (!channel) throw new Error("SLACK_CHANNEL_ID is not set (the C… id of the room's channel).");
    return { kind: "slack", token: process.env.SLACK_USER_TOKEN, channel };
  }
  if (!existsSync(credentialsFile)) {
    throw new Error(`Set SLACK_USER_TOKEN, or run \`pr-watcher.mjs register\` so ${credentialsFile} exists.`);
  }
  const creds = JSON.parse(readFileSync(credentialsFile, "utf8"));
  const endpoint = creds.SWITCH_API_ENDPOINT;
  const token = creds.SWITCH_API_TOKEN;
  const agentId = creds.SWITCH_AGENT_ID;
  const roomId = process.env.SWITCH_ROOM_ID;
  if (!endpoint || !token || !agentId) throw new Error(`${credentialsFile} is missing SWITCH_API_ENDPOINT, SWITCH_API_TOKEN or SWITCH_AGENT_ID.`);
  if (!roomId) throw new Error("SWITCH_ROOM_ID is not set.");
  return { kind: "switch", endpoint: endpoint.replace(/\/$/, ""), token, agentId, roomId };
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
  if (settings.kind === "slack") {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { Authorization: `Bearer ${settings.token}`, "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ channel: settings.channel, text: content, unfurl_links: false }),
    });
    const body = await res.json();
    if (!body.ok) throw new Error(`Slack answered: ${body.error}`);
  } else {
    const res = await fetch(`${settings.endpoint}/agents/${settings.agentId}/message`, {
      method: "POST",
      headers: { Authorization: `Bearer ${settings.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: settings.roomId, content }),
    });
    if (!res.ok) throw new Error(`Switch answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  log(`posted via ${settings.kind}: ${content}`);
}

let settings = null;
try {
  if (!dryRun) settings = transport();
} catch (error) {
  console.error(`pr-watcher: ${error.message}`);
  process.exit(1);
}

// --test: one message to check the route end to end, then exit
if (flag("test")) {
  await post("@canary-red The PR watcher is connected. No action needed: reply with one short line.", settings);
  process.exit();
}
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
