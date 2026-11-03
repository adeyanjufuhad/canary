import { en } from "@/content/en";
import { GITHUB_URL } from "@/lib/site";
import CanaryMark from "./CanaryMark";
import MobileMenu from "./MobileMenu";

const t = en.nav;
const cell = "flex items-center px-4 md:px-5 border-r border-ink";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm">
      <nav aria-label={t.ariaLabel} className="flex h-14 border-b border-ink">
        <a href="#top" className={`${cell} gap-2.5 shrink-0`} aria-label={t.homeLabel}>
          <span className="grid size-8 place-items-center bg-coal">
            <CanaryMark className="size-6 text-canary" />
          </span>
          <span className="display text-[26px] leading-none tracking-wide" translate="no">
            {t.brand}
          </span>
        </a>

        <ul className="hidden xl:flex flex-1">
          {t.links.map((link) => (
            <li key={link.href} className="flex">
              <a
                href={link.href}
                className={`${cell} label text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex">
          <a
            href={GITHUB_URL}
            className="hidden sm:flex items-center px-5 border-l border-ink label hover:bg-paper-2 transition-colors"
          >
            {t.github} <span aria-hidden="true" className="ml-1.5">↗</span>
          </a>
          <MobileMenu />
          <a
            href="#get-started"
            className="flex items-center px-4 md:px-6 border-l border-ink bg-canary label text-ink font-semibold hover:bg-ink hover:text-canary transition-colors"
          >
            {t.getStarted}
          </a>
        </div>
      </nav>
    </header>
  );
}
