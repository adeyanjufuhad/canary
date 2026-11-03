#!/usr/bin/env node
// Canary sandbox: runs one pull request's build of the demo wallet API on 127.0.0.1,
// against a freshly reset database. Run it from an agent folder (the one holding repo/ and .env.sandbox).
//
//   node repo/agents/tools/sandbox.mjs up 42           # PR #42 from GitHub
//   node repo/agents/tools/sandbox.mjs up --ref main   # any branch, tag or commit
//   node repo/agents/tools/sandbox.mjs diff            # files and rules the PR touches
//   node repo/agents/tools/sandbox.mjs status
//   node repo/agents/tools/sandbox.mjs down
//
// PR code is untrusted: npm install scripts are disabled, and the API gets only the sandbox
// database URL in its environment. It still runs on this machine, so only point Canary at
// pull requests from people you trust until the sandbox moves into a container.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const command = args[0];
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

const home = resolve(option("home", process.cwd()));
const repo = resolve(home, option("repo", "repo"));
const stateDir = join(home, ".sandbox");
const stateFile = join(stateDir, "state.json");
const worktree = join(stateDir, "worktree");
const port = Number(option("port", process.env.SANDBOX_PORT ?? 4100));
const isWindows = process.platform === "win32";

function fail(message) {
  console.error(`sandbox: ${message}`);
  process.exit(1);
}

function run(cmd, cmdArgs, opts = {}) {
  const res = spawnSync(cmd, cmdArgs, { encoding: "utf8", shell: opts.shell ?? false, ...opts });
  if (res.status !== 0) fail(`${cmd} ${cmdArgs.join(" ")} failed:\n${res.stderr || res.stdout}`);
  return (res.stdout ?? "").trim();
}

const git = (...gitArgs) => run("git", ["-C", repo, ...gitArgs]);

function readState() {
  return existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : null;
}

function sandboxDatabaseUrl() {
  const envFile = join(home, ".env.sandbox");
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const url = process.env.SANDBOX_DATABASE_URL;
  if (!url) fail(`SANDBOX_DATABASE_URL is not set (expected in ${envFile}).`);
  return url;
}

async function healthy() {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

function stopProcess(pid) {
  if (!pid) return;
  if (isWindows) spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
  else {
    try {
      process.kill(-pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

function removeWorktree() {
  if (existsSync(worktree)) spawnSync("git", ["-C", repo, "worktree", "remove", "--force", worktree], { stdio: "ignore" });
  rmSync(worktree, { recursive: true, force: true });
  spawnSync("git", ["-C", repo, "worktree", "prune"], { stdio: "ignore" });
}

function down() {
  const state = readState();
  stopProcess(state?.pid);
  removeWorktree();
  rmSync(stateFile, { force: true });
  console.log(state ? `sandbox stopped (${state.label})` : "sandbox was not running");
}

async function up() {
  if (!existsSync(join(repo, ".git"))) fail(`no git clone at ${repo}`);
  const databaseUrl = sandboxDatabaseUrl();
  if (readState()) down();
  if (await healthy()) fail(`port ${port} is already in use by something else`);

  // 1. Fetch the code under test
  const pr = args[1] && /^\d+$/.test(args[1]) ? Number(args[1]) : null;
  git("fetch", "--quiet", "origin");
  let ref = option("ref");
  if (pr) {
    git("fetch", "--quiet", "--force", "origin", `pull/${pr}/head:refs/canary/pr-${pr}`);
    ref = `refs/canary/pr-${pr}`;
  }
  if (!ref) fail("usage: sandbox.mjs up <pr-number> | up --ref <branch-or-commit>");
  const sha = git("rev-parse", "--verify", `${ref}^{commit}`);
  const label = pr ? `PR #${pr} @ ${sha.slice(0, 7)}` : `${ref} @ ${sha.slice(0, 7)}`;

  mkdirSync(stateDir, { recursive: true });
  removeWorktree();
  git("worktree", "add", "--quiet", "--detach", worktree, sha);
  const app = join(worktree, "demo-wallet");
  if (!existsSync(join(app, "package.json"))) fail(`${label} has no demo-wallet/package.json`);

  // 2. Install without lifecycle scripts, so a PR can't run code at install time
  console.log(`installing ${label}…`);
  run(isWindows ? "npm.cmd" : "npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], {
    cwd: app,
    shell: isWindows,
  });

  // 3. Only what the API needs: no tokens, no keys, no Switch or GitHub credentials
  const env = {
    PATH: process.env.PATH,
    ...(isWindows ? { SystemRoot: process.env.SystemRoot, TEMP: process.env.TEMP, TMP: process.env.TMP } : {}),
    DATABASE_URL: databaseUrl,
    PORT: String(port),
    HOST: "127.0.0.1",
  };
  const tsx = join(app, "node_modules", "tsx", "dist", "cli.mjs");
  run(process.execPath, [tsx, "src/migrate.ts", "--reset"], { cwd: app, env });

  // 4. Start the API in the background and wait for /health
  const logFile = join(stateDir, "server.log");
  const out = openSync(logFile, "w");
  const child = spawn(process.execPath, [tsx, "src/server.ts"], {
    cwd: app,
    env,
    detached: true,
    stdio: ["ignore", out, out],
    windowsHide: true,
  });
  child.unref();

  for (let waited = 0; waited < 60_000 && !(await healthy()); waited += 500) {
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!(await healthy())) {
    stopProcess(child.pid);
    fail(`the API did not start. Last log lines:\n${readFileSync(logFile, "utf8").split("\n").slice(-20).join("\n")}`);
  }

  const state = { label, pr, ref, sha, pid: child.pid, url: `http://127.0.0.1:${port}`, startedAt: new Date().toISOString() };
  writeFileSync(stateFile, JSON.stringify(state, null, 2));
  console.log(`sandbox ready: ${state.url} (${label})`);
}

function diff() {
  const state = readState();
  if (!state) fail("sandbox is not running; start it with `up` first");
  const base = git("merge-base", "origin/main", state.sha);
  console.log(`${state.label}, compared with main at ${base.slice(0, 7)}\n`);
  console.log(git("diff", "--stat", base, state.sha));
  console.log(`\nFull diff: git -C repo diff ${base.slice(0, 7)} ${state.sha.slice(0, 7)}`);
}

async function status() {
  const state = readState();
  if (!state) return console.log("sandbox is not running");
  console.log(`${state.label} on ${state.url}, healthy: ${await healthy()}, started ${state.startedAt}`);
}

const commands = { up, down, diff, status };
if (!commands[command]) fail("usage: sandbox.mjs up <pr> | up --ref <ref> | diff | status | down");
await commands[command]();
