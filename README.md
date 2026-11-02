# Canary

**Your team writes the rules of your product in plain English in chat. Canary tries to break them on every PR.**

Security scanners find SQL injection and XSS. They can't know that *a wallet can never go negative*, *a coupon works once per user*, or *a refund can't exceed the original charge*. Canary is for engineering and product teams anywhere. It puts two AI agents and your team in one [Switch](https://docs.switchagents.ai) room, in Slack, Microsoft Teams, Discord, or Mattermost:

- **`@canary-red`** reads each PR against your rules, writes an exploit per rule, runs it in a sandbox, and posts the evidence.
- **`@canary-blue`** writes the fix, and Red re-runs its exploit against it.
- **Humans** write the rules and rule on disputes. The room remembers every ruling.

> 🚧 Work in progress for the **Flip the Switch** hackathon (WeMakeDevs × DevTools Academy × Switch, Nov 4–7, 2026). Quickstart, demo, and docs are on the way.

## License

[MIT](LICENSE)
