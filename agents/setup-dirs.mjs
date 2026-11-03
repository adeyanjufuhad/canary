#!/usr/bin/env node
// Creates (or refreshes) the working folders for canary-red and canary-blue.
// Pick these folders as each agent's Directory in Switch Console.
//
//   node agents/setup-dirs.mjs                      # ~/canary-agents
//   node agents/setup-dirs.mjs --root D:\canary-agents
//
// Each folder gets: CLAUDE.md (the agent's standing instructions), repo/ (a clone of this
// repository), and an empty env file for its database URL. Secrets are never written here
// by this script; fill in the env files yourself. Keep these folders out of any repository.

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const rootArg = args.indexOf("--root");
const root = resolve(rootArg >= 0 ? args[rootArg + 1] : join(homedir(), "canary-agents"));
const repoUrl = "https://github.com/adeyanjufuhad/canary.git";

const ENV_FILES = {
  "canary-red": {
    path: ".env.sandbox",
    body: "# Postgres database the sandbox resets for every run. Use a project with nothing else in it.\nSANDBOX_DATABASE_URL=\n",
  },
  "canary-blue": {
    path: "repo/demo-wallet/.env",
    body: "# Postgres database Blue's test runs may wipe. Use a project with nothing else in it.\nTEST_DATABASE_URL=\n",
  },
};

function git(...gitArgs) {
  const res = spawnSync("git", gitArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (res.status !== 0) throw new Error(`git ${gitArgs.join(" ")}: ${res.stderr}`);
}

for (const agent of ["canary-red", "canary-blue"]) {
  const dir = join(root, agent);
  const repo = join(dir, "repo");
  mkdirSync(dir, { recursive: true });

  if (existsSync(join(repo, ".git"))) {
    git("-C", repo, "fetch", "--quiet", "origin");
    git("-C", repo, "checkout", "--quiet", "main");
    git("-C", repo, "merge", "--quiet", "--ff-only", "origin/main");
  } else {
    git("clone", "--quiet", repoUrl, repo);
  }

  copyFileSync(join(here, `${agent}.md`), join(dir, "CLAUDE.md"));
  if (agent === "canary-red") mkdirSync(join(dir, "exploits"), { recursive: true });

  const env = ENV_FILES[agent];
  const envPath = join(dir, env.path);
  if (!existsSync(envPath)) writeFileSync(envPath, env.body);

  console.log(`${agent}: ${dir}`);
}

console.log("\nNext: fill in the env files, then create the agents in Switch Console with these folders.");
