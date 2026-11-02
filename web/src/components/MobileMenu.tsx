"use client";

import { useRef } from "react";
import { en } from "@/content/en";
import { GITHUB_URL } from "@/lib/site";

const t = en.nav;

/** Disclosure menu for narrow screens; closes when a link is chosen or Escape is pressed. */
export default function MobileMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => ref.current?.removeAttribute("open");

  return (
    <details
      ref={ref}
      className="group xl:hidden"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          close();
          ref.current?.querySelector("summary")?.focus();
        }
      }}
    >
      <summary
        aria-label={t.menuLabel}
        className="label flex h-full cursor-pointer list-none items-center gap-2 border-l border-ink px-4 hover:bg-paper-2 [&::-webkit-details-marker]:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 transition-transform duration-300 group-open:rotate-45">
          <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" />
        </svg>
        {t.menuOpen}
      </summary>
      <div
        onClick={(e) => (e.target as HTMLElement).closest("a") && close()}
        className="absolute inset-x-0 top-full z-40 border-b border-ink bg-paper shadow-[0_24px_40px_-24px_rgba(20,19,16,0.35)]"
      >
        <ul className="divide-y divide-rule">
          {t.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="display block px-4 py-3.5 text-2xl leading-none hover:bg-paper-2">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href={GITHUB_URL} className="label block px-4 py-4 text-ink-2 hover:bg-paper-2">
              {t.github} <span aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </div>
    </details>
  );
}
