"use client";

import { useSyncExternalStore } from "react";
import { en } from "@/content/en";

const t = en.status;

/** HH:MM:SS in UTC, identical for every visitor regardless of locale. */
const utcTime = () => new Date().toISOString().slice(11, 19);

const subscribe = (onTick: () => void) => {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
};

const useClock = () => useSyncExternalStore(subscribe, utcTime, () => null);

export default function StatusStrip() {
  const time = useClock();

  return (
    <div className="label flex h-8 items-center gap-5 overflow-hidden whitespace-nowrap border-b border-rule px-4 md:px-5 text-ink-2">
      <span className="flex items-center gap-2 text-ink">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-held animate-rec" />
        {t.live}
      </span>
      <span>{t.room}</span>
      <span className="hidden sm:inline">{t.rules}</span>
      <span className="hidden md:inline">
        {t.lastPr} <span className="text-broken">{t.broken}</span>, {t.then}{" "}
        <span className="text-held">{t.fixed}</span>
      </span>
      <span className="ml-auto tabular-nums">
        {t.timezone} {time ?? "--:--:--"}
      </span>
    </div>
  );
}
