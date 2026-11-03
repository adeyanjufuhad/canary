# Canary agents

`@canary-red` and `@canary-blue` are [Claude Code](https://claude.com/claude-code) sessions that [Switch Console](https://docs.switchagents.ai) runs on your computer and connects to a Slack channel. This folder holds everything they use:

| Path | What it is |
|---|---|
| `canary-red.md`, `canary-blue.md` | Each agent's standing instructions. `setup-dirs.mjs` copies them into the agent's folder as `CLAUDE.md`. |
| `setup-dirs.mjs` | Creates `~/canary-agents/canary-red` and `~/canary-agents/canary-blue`, each with a clone of this repo. |
| `tools/sandbox.mjs` | Runs one pull request's build of the demo wallet API on `127.0.0.1:4100` against a freshly reset database. |
| `tools/exploit.mjs` | Helpers for exploit scripts. Every request prints one evidence line in UTC. |
| `exploits/rule-*.mjs` | One ready-made race attack per rule in [`demo-wallet/RULES.md`](../demo-wallet/RULES.md). |
| `tools/pr-watcher.mjs` | Tells `@canary-red` in the room when a pull request opens or changes, posting as its own agent, `canary-watch`. |

## How a pull request flows

1. **PR watcher:** it checks GitHub every 30 seconds with `gh`. When a pull request opens or gets new commits, it posts `@canary-red PR #42 opened: …` into the room as `canary-watch`, its own small Switch agent.
2. **canary-red:**
   - starts the sandbox for that PR and reads the diff;
   - runs the exploits for the rules the change touches;
   - posts the evidence;
   - asks `@canary-blue` for a fix when a rule breaks.
3. **canary-blue:** checks out the PR, writes the fix and a regression test, runs the tests, and pushes to the PR branch.
4. **The watcher sees the new commit and tells Red.** Red runs the same exploit again and reports whether the rule now holds.
5. **Rules and rulings:** people write rules and make rulings in the channel. Red keeps both in a room document named `canary-rules`.

Why it is built this way:
- **No public address.** The Switch server runs on your computer, and GitHub can't reach it. So the watcher polls GitHub from the same machine instead of receiving webhooks.
- **No GitHub event support in Switch.** Switch has no built-in sandbox or GitHub pull-request events, so both are built here.

## Setup

You need Node.js 20+, Git, the [GitHub CLI](https://cli.github.com) signed in with push access to this repository, and a Slack workspace where you can install an app.

### 1. Claude Code

```bash
claude auth login
```

### 2. Switch Console and a local server

1. Install [Switch Console for Windows](https://github.com/sandbox-quantum/switch/releases/latest/download/switch-console-x64.exe) (or [another platform](https://docs.switchagents.ai/switch-rooms/getting-started/install-switch-console.md)).
2. In Console, open **Settings → Agent providers**. Claude Code must say **Signed in**. If it says not installed, quit Console completely and open it again.
3. Select **Add a server → Run a server on this computer → Start**. Docker is only needed for Switch's bundled Mattermost, not for Slack.

### 3. Slack

Follow the [Switch Slack guide](https://docs.switchagents.ai/switch-rooms/deploy/messaging-apps/slack.md). In short:

1. **Create the app:** at https://api.slack.com/apps choose **Create New App → From an app manifest**, and paste the manifest from that guide. If your workspace has guest accounts, delete the `agent_view` block first. It can't be undone.
2. **Collect three values:**
   - an **App-Level Token** with `connections:write` (starts with `xapp-`);
   - the **Bot User OAuth Token** (starts with `xoxb-`);
   - your workspace ID (the `T…` part of the Slack web address).
3. **Connect in Switch Console:** go to **Home → Messaging apps → Connect → Slack**. Turn **off** "Agent name autocomplete" unless you have a paid Slack plan; it can't be changed later from Console.
4. **Link your account:** select **Link → This is me**, so Switch knows you own the agents.
5. **Make the room:** create a channel (for example `#canary`) and run `/invite @Agent Switch` in it.

### 4. Agent folders

From the repository root:

```bash
node agents/setup-dirs.mjs
```

Then fill in the two env files it creates. Use a Postgres database that holds nothing else, because both get wiped:

- `~/canary-agents/canary-red/.env.sandbox`: `SANDBOX_DATABASE_URL`, which the sandbox resets for every run.
- `~/canary-agents/canary-blue/repo/demo-wallet/.env`: `TEST_DATABASE_URL`, which Blue's test runs wipe.

### 5. Create the agents

In Switch Console, go to **Your Agents → +** twice:

| Field | canary-red | canary-blue |
|---|---|---|
| Name | `canary-red` | `canary-blue` |
| Description | Finds pull requests that break the team's business rules, with a working exploit. | Fixes rules that canary-red proves broken, with a regression test. |
| Run location | This computer | This computer |
| Directory | `~/canary-agents/canary-red` | `~/canary-agents/canary-blue` |
| Agent provider | Claude Code | Claude Code |
| Auto mode | On | On |
| Bypass permissions | **Off** | **Off** |
| Who can talk to your agent | Me and my agents (add teammates with Custom rules) | Me and my agents |

Then add both agents to the room, either with **Add to room** in Console or by typing `!invite-agent @canary-red` and `!invite-agent @canary-blue` in the channel. In Slack these are chat messages, not terminal commands.

**Check each agent's Directory.** In Switch Console 0.40, a new agent may start in a default folder under `~/.switch/agents/…` instead of the one you picked. Open the agent's ⚙ settings and, if needed, use **Choose…** next to Directory to select its `~/canary-agents/<name>` folder. Then ask it in a new chat: "What is your job, and which folder are you working in?" It should answer from its `CLAUDE.md`.

### 6. Start the PR watcher

The watcher tells `@canary-red` about pull requests. There are two ways for it to post into the room.

**Slack, as you (use this with a local server).** A local server without Docker has no Gateway, so it has no page for creating registration keys. Instead, the watcher posts in the room's Slack channel with your own user token. Switch treats your linked account as the agents' owner, so Red accepts the message.

1. **Add the scope.** In your Slack app, go to **OAuth & Permissions → User Token Scopes** and add `chat:write`. Then **Reinstall** the app.
2. **Save the settings.** Copy the **User OAuth Token** (`xoxp-…`) into `~/canary-agents/.env.watcher`, together with the room's channel ID (the `C…` part of the channel's Slack web address):

   ```bash
   SLACK_USER_TOKEN=xoxp-…
   SLACK_CHANNEL_ID=C…
   ```

**Through Switch, as its own agent (servers with a Gateway).** Create a registration key under **API Keys** in the Gateway, and put it in `.env.watcher` as `SWITCH_REGISTRATION_KEY`. Then run `node agents/tools/pr-watcher.mjs register` once, invite the new agent with `!invite-agent @canary-watch`, and set `SWITCH_ROOM_ID`.

Test the route once. Red should reply in the thread:

```bash
node agents/tools/pr-watcher.mjs --test
```

Then run it from the repository root and leave it running:

```bash
node agents/tools/pr-watcher.mjs
```

Check it first with `--dry-run --once`, which prints what it would post and exits.

### 7. First message in the room

```text
@canary-red rule: A refund can never be more than the original charge.
```

## Safety

Canary runs code from pull requests. The Switch docs' own safety test applies here: an agent that runs unattended, reads untrusted input, and can reach something that matters needs one of those three removed.

**What is in place:**
- **Unattended:** Auto mode stays on, but Bypass permissions stays **off**, so risky actions still ask in the room.
- **Untrusted input:** both instruction files treat pull request content as data, never as instructions.
- **Install scripts:** the sandbox installs dependencies with `npm ci --ignore-scripts`, so a pull request can't run code at install time.
- **Minimal environment:** the API under test gets only the sandbox database URL, a port, and `PATH`. No Switch, GitHub, or model credentials.
- **Local only:** the API under test listens on `127.0.0.1` only, and exploits may only target it.
- **Separate databases:** the sandbox and Blue's tests use a database project that holds nothing else.
- **Least access for Red:** Red never pushes. Only Blue pushes, and only to the branch of the pull request it was asked to fix.

**What is not:** the pull request's code still runs on your computer, as your user. Until the sandbox moves into a container or VM, point Canary only at pull requests from people you trust.

## Verified so far

| Check | Status |
|---|---|
| Sandbox on `main`: all four exploits report the rule holds | Verified |
| Sandbox on a branch with the refund lock removed: the 3-refund exploit reports $4,500 refunded on a $1,500 charge (3 of 3 runs) | Verified |
| PR watcher reads open pull requests from GitHub and formats the messages (`--dry-run`) | Verified |
| PR watcher posting into the room (Slack route): Red replies to the test message | Verified |
| canary-red and canary-blue running in Switch and Slack: Red saves rule 1 from a Slack message | Verified |
| Full pull request round trip (Red finds, Blue fixes, Red re-tests) | Next |
