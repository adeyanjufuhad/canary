/**
 * Every user-facing string on the landing page lives here.
 * To add a language later, copy this file (e.g. fr.ts) and keep the same shape.
 * Style: plain international English, short sentences, American spelling, USD, UTC.
 */
export const en = {
  meta: {
    title: "Canary: your team writes the rules, Canary tries to break them",
    description:
      "Write your product’s business rules in plain English, in chat. On every pull request, Canary’s AI agents try to break them. Built on Switch.",
  },

  skipLink: "Skip to content",

  nav: {
    ariaLabel: "Main",
    homeLabel: "Canary home",
    brand: "Canary",
    links: [
      { href: "#how", label: "How It Works" },
      { href: "#room", label: "The Room" },
      { href: "#rules", label: "Rules" },
      { href: "#vs", label: "vs Scanners" },
      { href: "#quickstart", label: "Quickstart" },
      { href: "#faq", label: "FAQ" },
    ],
    github: "GitHub",
    waitlist: "Join Waitlist",
    menuOpen: "Menu",
    menuLabel: "Open the menu",
  },

  status: {
    live: "Live",
    room: "Room #canary",
    rules: "Rules 03",
    lastPr: "Last PR #42: rule 1",
    broken: "broken",
    then: "then",
    fixed: "fixed",
    timezone: "UTC",
  },

  hero: {
    eyebrow: "/00 — Business-rule testing for engineering teams",
    headline: {
      line1: "Your team writes",
      line2: "the rules.",
      accent: "Canary",
      line3: "tries to",
      line4: "break them.",
    },
    subhead:
      "Write your product’s rules in plain English, in chat. On every pull request, two AI agents try to break them. A person on your team makes every final decision.",
    ctaGithub: "View on GitHub",
    ctaDemo: "Watch the Demo",
    worksIn: "For engineering and product teams. Works in",
    chatApps: ["Slack", "Microsoft Teams", "Discord", "Mattermost"],
    stats: [
      { value: "03", label: "Rules typed in chat" },
      { value: "#42", label: "Pull request that broke rule 1" },
      { value: "−$4,500", label: "Caught before merge", accent: true },
      { value: "0", label: "Rulings flagged twice" },
    ],
  },

  heroVisual: {
    address: "canary://shaft-01",
    rec: "Rec",
    videoLabel: "A glowing canary-yellow light drifting down a dark mine shaft",
    readouts: ["Shaft 01", "Level B-7", "Depth −412 m"],
    pause: "Pause background video",
    play: "Play background video",
  },

  gap: {
    eyebrow: "/01 — The gap",
    title: "Scanners check your code. Nobody checks your rules.",
    body: [
      "Security scanners look for known patterns, like SQL injection and XSS. They do that well.",
      "But they can’t know your product. Only your team knows that a refund can never be more than the original charge, or that a promo code works once per customer.",
      "When a pull request breaks one of those rules, every check stays green. The bug ships, and customers or attackers find it first.",
    ],
    file: "src/refunds/create.ts",
    code: [
      { n: 12, text: "export async function createRefund(chargeId, amount) {" },
      { n: 13, text: "  const charge = await db.charges.find(chargeId)" },
      { n: 14, text: "  if (amount > charge.amount) throw new BadRequest()", flag: true },
      { n: 15, text: "  return db.refunds.insert({ chargeId, amount })" },
      { n: 16, text: "}" },
    ],
    flagNote: "Checks one refund at a time. Three refunds at once each pass this check.",
    results: [
      { tool: "Security scanner", verdict: "0 issues found", tone: "neutral" },
      { tool: "Unit tests", verdict: "48 of 48 passed", tone: "neutral" },
      { tool: "Canary", verdict: "Rule 1 broken: $4,500 refunded on a $1,500 charge", tone: "broken" },
    ],
  },

  how: {
    eyebrow: "/02 — How it works",
    title: "From a sentence in chat to a tested fix.",
    intro: "No config files and no test code. You talk to Canary the same way you talk to your team.",
    steps: [
      {
        n: "01",
        title: "Write rules in chat",
        body: "Type a rule in plain English in your team’s channel. Canary saves it and numbers it.",
        sample: "@canary-red rule: A refund can never be more than the original charge.",
      },
      {
        n: "02",
        title: "Open a pull request",
        body: "Canary reads the diff and finds which rules the change could affect.",
        sample: "PR #42 · Split refunds into partial payments · touches rule 1",
      },
      {
        n: "03",
        title: "Red tries to break them",
        body: "@canary-red writes an exploit for each rule, runs it in a sandbox, and posts the evidence in the room.",
        sample: "3 parallel refunds · $4,500 refunded · rule 1 broken",
      },
      {
        n: "04",
        title: "Blue fixes, your team decides",
        body: "@canary-blue writes a fix and Red runs the exploit again. A person on your team makes the final call, and the room remembers it.",
        sample: "Fix pushed · exploit re-run · rule 1 holds · ruling saved",
      },
    ],
  },

  room: {
    eyebrow: "/03 — The room",
    title: "Watch one pull request go through the room.",
    intro:
      "Two agents and your team share one channel. Everything happens in the open, so anyone can follow the evidence and the decisions.",
    channel: "#canary",
    date: "Nov 4, 2026",
    shownIn: "Shown in Slack. It works the same in Microsoft Teams, Discord, and Mattermost.",
    replay: "Replay",
    skip: "Show All",
    membersTitle: "In the room",
    members: [
      { name: "Priya Raman", role: "Engineering lead" },
      { name: "Lucas Moreau", role: "Backend engineer" },
      { name: "Aiko Tanaka", role: "Reviewer" },
      { name: "Amara Okafor", role: "Product manager" },
      { name: "Marcus Bell", role: "Support lead" },
      { name: "Sofia Lindqvist", role: "Finance" },
      { name: "canary-red", role: "Breaks rules", agent: "red" },
      { name: "canary-blue", role: "Writes fixes", agent: "blue" },
    ],
    messages: [
      {
        who: "Amara Okafor",
        time: "09:12",
        body: "@canary-red rule: A refund can never be more than the original charge.",
      },
      {
        who: "canary-red",
        agent: "red",
        time: "09:12",
        body: "Saved as rule 1. I will test it on every pull request.",
      },
      {
        who: "GitHub",
        system: true,
        time: "14:02",
        body: "Lucas Moreau opened PR #42: Split refunds into partial payments.",
      },
      {
        who: "canary-red",
        agent: "red",
        time: "14:05",
        tag: "broken",
        body: "Rule 1 broken in PR #42. I sent 3 refunds of $1,500 at the same time against one $1,500 charge. All 3 succeeded. Total refunded: $4,500.",
        code: [
          "14:04:51.120Z POST /refunds {charge: \"ch_8Kq2\", amount: 150000} → 201",
          "14:04:51.121Z POST /refunds {charge: \"ch_8Kq2\", amount: 150000} → 201",
          "14:04:51.121Z POST /refunds {charge: \"ch_8Kq2\", amount: 150000} → 201",
          "refunded 450000 cents · charge 150000 cents",
        ],
      },
      {
        who: "canary-blue",
        agent: "blue",
        time: "14:09",
        body: "Fix pushed to PR #42. It locks the charge and checks the refund total before it saves. I added a regression test.",
        code: [
          "+ const charge = await tx.charges.lockForUpdate(chargeId)",
          "+ if (charge.refunded + amount > charge.amount) throw new Conflict()",
        ],
      },
      {
        who: "canary-red",
        agent: "red",
        time: "14:11",
        tag: "held",
        body: "I ran the exploit again on the fix. 1 refund succeeded and 2 were rejected with 409. Rule 1 holds.",
      },
      {
        who: "Marcus Bell",
        time: "14:16",
        body: "Question: support sometimes refunds the shipping fee on top. Is that allowed?",
      },
      {
        who: "Priya Raman",
        time: "14:18",
        tag: "ruling",
        body: "Ruling: no. Shipping is part of the charge, so the total refund can’t go above it.",
      },
      {
        who: "canary-red",
        agent: "red",
        time: "14:18",
        body: "Ruling saved. I won’t flag this case again.",
      },
      {
        who: "Aiko Tanaka",
        time: "14:22",
        body: "Approved and merged. Thanks, both.",
      },
    ],
    tags: { broken: "Rule broken", held: "Rule holds", ruling: "Ruling" },
  },

  rules: {
    eyebrow: "/04 — Rules",
    title: "The rules every product team already has.",
    intro: "If you can say it in one sentence, Canary can test it. These are common first rules.",
    columns: { rule: "Rule in chat", attack: "How Red attacks it" },
    items: [
      {
        area: "Wallets",
        rule: "A wallet balance can never go below $0.",
        attack: "Two withdrawals at the same moment, each for the full balance.",
      },
      {
        area: "Promo codes",
        rule: "A promo code works once per customer.",
        attack: "The same code from two sessions, then from a second account with the same card.",
      },
      {
        area: "Refunds",
        rule: "A refund can never be more than the original charge.",
        attack: "Several partial refunds on one charge, sent in parallel.",
      },
      {
        area: "Seats",
        rule: "A team on the Starter plan has at most 5 seats.",
        attack: "Invite 5 people, then accept 2 old invites that never expired.",
      },
      {
        area: "Free trials",
        rule: "Each organization gets one free trial.",
        attack: "Cancel, delete the organization, and sign up again with the same billing details.",
      },
      {
        area: "Inventory",
        rule: "Stock can never go below zero.",
        attack: "Ten checkouts for the last item, all at once.",
      },
    ],
  },

  vs: {
    eyebrow: "/05 — vs Scanners",
    title: "A different job from your scanner.",
    intro: "Canary does not replace your security scanner. Run both. They catch different bugs.",
    columns: { check: "What it does", scanner: "Security scanner", canary: "Canary" },
    rows: [
      { check: "Finds SQL injection, XSS, and known CVEs", scanner: "Yes", canary: "No, keep your scanner", scannerOk: true, canaryOk: false },
      { check: "Knows your product’s rules", scanner: "No", canary: "Yes, you write them in chat", scannerOk: false, canaryOk: true },
      { check: "Proves each bug with a working exploit", scanner: "Sometimes", canary: "Yes, run in a sandbox", scannerOk: false, canaryOk: true },
      { check: "Writes the fix and tests it again", scanner: "No", canary: "Yes, Blue fixes and Red re-tests", scannerOk: false, canaryOk: true },
      { check: "Remembers your team’s decisions", scanner: "No", canary: "Yes, every ruling is saved", scannerOk: false, canaryOk: true },
      { check: "Works where your team talks", scanner: "In a dashboard", canary: "Slack, Teams, Discord, Mattermost", scannerOk: false, canaryOk: true },
    ],
  },

  quickstart: {
    eyebrow: "/06 — Quickstart",
    title: "Run Canary on your own repo.",
    intro:
      "Canary is open source. You need Node.js 20+, Git, the GitHub CLI, and a chat workspace where you can install an app. The full guide is in agents/README.md in the repo.",
    copy: "Copy",
    copied: "Copied",
    steps: [
      {
        title: "Clone the repo",
        lang: "bash",
        code: "git clone https://github.com/adeyanjufuhad/canary.git\ncd canary",
      },
      {
        title: "Start Switch on your computer",
        lang: "",
        code: "",
        note: "Install Switch Console, then choose Add a server → Run a server on this computer. Switch connects the agents to your chat app.",
      },
      {
        title: "Connect your chat app",
        lang: "",
        code: "",
        note: "Create a chat app from the Switch guide, connect it in Switch Console, and link your own account. Then make a channel, such as #canary, and invite Switch to it.",
      },
      {
        title: "Add the two agents",
        lang: "bash",
        code: "node agents/setup-dirs.mjs",
        note: "This makes a working folder for canary-red and canary-blue. In Switch Console, add both agents, pick each one’s folder, and invite them to the channel.",
      },
      {
        title: "Write your first rule in chat",
        lang: "chat",
        code: "@canary-red rule: A wallet balance can never go below $0.",
        note: "Red saves the rule and numbers it. Add one rule for each thing that must always be true.",
      },
      {
        title: "Start the watcher, then open a pull request",
        lang: "bash",
        code: "node agents/tools/pr-watcher.mjs",
        note: "The watcher checks GitHub every 30 seconds and tells Red about new pull requests. Red tests each one and posts the results in the channel.",
      },
    ],
  },

  faq: {
    eyebrow: "/07 — FAQ",
    title: "Questions teams ask first.",
    items: [
      {
        q: "Does Canary replace my security scanner?",
        a: "No. Scanners find known patterns like SQL injection. Canary tests the rules that only your team knows. Use both.",
      },
      {
        q: "Where do the exploits run?",
        a: "In a sandbox: the pull request’s build of your app, with a test database that is reset before every run. Canary never runs exploits against production. Today the sandbox runs on your own computer, so only point Canary at pull requests from people you trust.",
      },
      {
        q: "Can Canary find bugs nobody wrote a rule for?",
        a: "No. Canary tests the rules your team writes. Keep your scanner and your tests for everything else, and add a rule whenever your team agrees on something that must always be true.",
      },
      {
        q: "Which chat apps does it work with?",
        a: "Slack, Microsoft Teams, Discord, and Mattermost. Canary runs on Switch, which connects the agents to the chat app your team already uses.",
      },
      {
        q: "Who decides when an agent is wrong?",
        a: "A person on your team. Anyone can dispute a result in the thread. The ruling is saved, and Canary follows it on every future pull request.",
      },
      {
        q: "How do I write a good rule?",
        a: "Use one sentence that states what must always be true. For example: “A promo code works once per customer.” Avoid rules about how the code works inside.",
      },
      {
        q: "Is Canary free?",
        a: "Canary is open source under the MIT license. The agents run on your own AI model account, so you only pay your model provider for what you use.",
      },
    ],
  },

  waitlist: {
    eyebrow: "/08 — Early access",
    title: "Be first to test your rules.",
    body: "Get one email when the first release is ready. Nothing else.",
    label: "Work email",
    placeholder: "name@company.com…",
    hint: "One email when the first release is ready.",
    submit: "Join Waitlist",
    submitting: "Joining…",
    success: "You’re on the list. Watch your inbox for the release email.",
    invalid: "Enter a valid email address, like name@company.com.",
    closed: "Sign-ups aren’t open yet. Star the repo on GitHub to follow progress.",
    failed: "Something went wrong. Try again in a minute.",
    star: "Star on GitHub",
  },

  footer: {
    navLabel: "Footer",
    tagline: "Business-rule testing for engineering and product teams.",
    columns: [
      {
        title: "Product",
        links: [
          { href: "#how", label: "How It Works" },
          { href: "#room", label: "The Room" },
          { href: "#rules", label: "Rules" },
          { href: "#vs", label: "vs Scanners" },
        ],
      },
      {
        title: "Get started",
        links: [
          { href: "#quickstart", label: "Quickstart" },
          { href: "#faq", label: "FAQ" },
          { href: "#waitlist", label: "Join Waitlist" },
        ],
      },
      {
        title: "Project",
        links: [
          { href: "github", label: "GitHub" },
          { href: "license", label: "MIT License" },
          { href: "switch", label: "Built on Switch" },
        ],
      },
    ],
    event: "Built for the Flip the Switch hackathon, Nov 4–7, 2026.",
    copyright: "© 2026 Canary contributors.",
  },
} as const;

export type Content = typeof en;
