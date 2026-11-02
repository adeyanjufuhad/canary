"use client";

import { useEffect, useState } from "react";

export default function CopyButton({ text, label, doneLabel }: { text: string; label: string; doneLabel: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true), () => {})}
      className="label h-7 px-2.5 text-paper/70 ring-1 ring-coal-line transition-colors hover:bg-paper hover:text-ink active:translate-y-px focus-visible:outline-canary"
    >
      <span aria-live="polite">{copied ? doneLabel : label}</span>
    </button>
  );
}
