"use client";

import { useEffect, useRef, useState } from "react";
import { en } from "@/content/en";
import CanaryMark from "../CanaryMark";

const t = en.room;
type Message = (typeof t.messages)[number];

const TOTAL = t.messages.length;
const MENTION = /(@canary-(?:red|blue))/g;

const tagStyle = {
  broken: "bg-broken text-paper",
  held: "bg-held text-paper",
  ruling: "bg-canary text-ink",
} as const;

/** How long the "typing" pause lasts before a message appears. */
const delayFor = (m: Message) => Math.min(2200, 650 + m.body.length * 9);

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

function Avatar({ m }: { m: Message }) {
  if ("agent" in m) {
    return (
      <span
        aria-hidden="true"
        className={`grid size-9 shrink-0 place-items-center ${m.agent === "red" ? "bg-broken" : "bg-agent-blue"}`}
      >
        <CanaryMark className="size-6 text-paper" />
      </span>
    );
  }
  if ("system" in m) {
    return <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center bg-ink-2 font-mono text-xs text-paper">GH</span>;
  }
  return (
    <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center bg-ink font-mono text-xs text-paper">
      {initials(m.who)}
    </span>
  );
}

function Body({ text }: { text: string }) {
  return (
    <p className="break-words leading-snug text-ink">
      {/* split() with a capture group puts the mentions at odd indices */}
      {text.split(MENTION).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} translate="no" className="bg-canary/45 px-0.5 font-medium">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  );
}

/**
 * The PR #42 story, replayed message by message when it scrolls into view.
 * Every message is in the DOM from the start, so screen readers and no-JS visitors get the whole transcript.
 */
export default function RoomReplay() {
  // null = everything visible (server render, reduced motion, or "Show All")
  const [shown, setShown] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!started && entry.isIntersecting && entry.intersectionRatio > 0.3) {
          started = true;
          setShown(0);
          observer.disconnect();
        } else if (!started && !entry.isIntersecting) {
          setShown(0); // arm off-screen so the replay starts from an empty room
        }
      },
      { threshold: [0, 0.3] },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shown === null || shown >= TOTAL) return;
    const startTyping = window.setTimeout(() => setTyping(true), 250);
    const next = window.setTimeout(() => {
      setTyping(false);
      setShown(shown + 1);
    }, delayFor(t.messages[shown]));
    return () => {
      window.clearTimeout(startTyping);
      window.clearTimeout(next);
    };
  }, [shown]);

  // keep the newest message in view inside the log, without scrolling the page
  useEffect(() => {
    const log = logRef.current;
    if (log && shown !== null) log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
  }, [shown, typing]);

  const visible = (i: number) => shown === null || i < shown;
  const done = shown === null || shown >= TOTAL;
  const nextUp = shown !== null && shown < TOTAL ? t.messages[shown] : null;

  return (
    <div ref={rootRef} className="grid bg-paper ring-1 ring-ink lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-ink bg-paper-2 lg:block" aria-label={t.membersTitle}>
        <p className="label border-b border-rule px-4 py-3 text-ink-2">{t.membersTitle}</p>
        <ul className="space-y-0.5 p-2">
          {t.members.map((m) => (
            <li key={m.name} className="flex items-center gap-2.5 px-2 py-1.5">
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${"agent" in m ? (m.agent === "red" ? "bg-broken" : "bg-agent-blue") : "bg-held"}`}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium" translate={"agent" in m ? "no" : undefined}>
                  {m.name}
                </span>
                <span className="block truncate text-xs text-ink-2">{m.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex h-12 items-center justify-between gap-3 bg-coal px-4 text-paper">
          <p className="flex min-w-0 items-baseline gap-3">
            <span className="font-mono text-sm font-semibold" translate="no">{t.channel}</span>
            <span className="label truncate text-paper/60">{t.date}</span>
          </p>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setShown(0)}
              className="label h-8 px-3 text-paper/80 ring-1 ring-coal-line transition-colors hover:bg-paper hover:text-ink focus-visible:outline-canary"
            >
              {t.replay}
            </button>
            {!done && (
              <button
                type="button"
                onClick={() => {
                  setTyping(false);
                  setShown(null);
                }}
                className="label h-8 px-3 text-paper/80 ring-1 ring-coal-line transition-colors hover:bg-paper hover:text-ink focus-visible:outline-canary"
              >
                {t.skip}
              </button>
            )}
          </div>
        </header>

        <ol ref={logRef} className="h-[560px] space-y-1 overflow-y-auto overscroll-contain px-2 py-4 md:h-[620px] md:px-4">
          {t.messages.map((m, i) => (
            <li
              key={i}
              className={`flex gap-3 px-2 py-2.5 transition-[opacity,transform] duration-500 ease-out ${
                visible(i) ? "opacity-100" : "pointer-events-none h-0 translate-y-2 overflow-hidden py-0 opacity-0"
              } ${"tag" in m && m.tag === "broken" ? "bg-broken/[0.07]" : ""}`}
            >
              <Avatar m={m} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-semibold" translate={"agent" in m ? "no" : undefined}>
                    {m.who}
                  </span>
                  <time className="font-mono text-xs text-ink-2">{m.time} UTC</time>
                  {"tag" in m && (
                    <span className={`label px-1.5 py-0.5 text-[10px] ${tagStyle[m.tag]}`}>{t.tags[m.tag]}</span>
                  )}
                </p>
                <div className={"system" in m ? "text-ink-2 [&_p]:text-ink-2" : ""}>
                  <Body text={m.body} />
                </div>
                {"code" in m && (
                  <pre className="mt-2 overflow-x-auto bg-coal px-3 py-2.5 font-mono text-[12px] leading-5 text-paper/90">
                    {m.code.map((line, j) => (
                      // log lines can repeat verbatim, so key by position
                      <code key={j} className={`block whitespace-pre ${line.startsWith("+") ? "text-held" : ""}`}>
                        {line}
                      </code>
                    ))}
                  </pre>
                )}
              </div>
            </li>
          ))}
          {typing && nextUp && (
            <li aria-hidden="true" className="flex items-center gap-3 px-2 py-2.5">
              <Avatar m={nextUp} />
              <span className="animate-typing flex gap-1">
                <span className="size-1.5 rounded-full bg-ink-2" />
                <span className="size-1.5 rounded-full bg-ink-2" />
                <span className="size-1.5 rounded-full bg-ink-2" />
              </span>
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
