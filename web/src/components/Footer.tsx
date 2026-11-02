import { en } from "@/content/en";
import { GITHUB_URL, SWITCH_URL } from "@/lib/site";
import CanaryMark from "./CanaryMark";

const t = en.footer;

const external: Record<string, string> = {
  github: GITHUB_URL,
  license: `${GITHUB_URL}/blob/main/LICENSE`,
  switch: SWITCH_URL,
};

export default function Footer() {
  return (
    <footer className="bg-coal text-paper">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 md:grid-cols-12 md:px-8 md:py-16">
        <div className="md:col-span-5">
          <a href="#top" className="inline-flex items-center gap-3" aria-label={en.nav.homeLabel}>
            <CanaryMark className="size-9 text-canary" />
            <span className="display text-3xl leading-none" translate="no">{en.nav.brand}</span>
          </a>
          <p className="mt-5 max-w-[34ch] text-paper/70">{t.tagline}</p>
          <p className="label mt-6 text-paper/50">{t.event}</p>
        </div>

        <nav aria-label={t.navLabel} className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
          {t.columns.map((col) => (
            <div key={col.title}>
              <p className="label text-paper/50">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => {
                  const href = external[link.href] ?? link.href;
                  const isExternal = href.startsWith("http");
                  return (
                    <li key={link.label}>
                      <a href={href} className="text-paper/85 transition-colors hover:text-canary focus-visible:outline-canary">
                        {link.label}
                        {isExternal && <span aria-hidden="true"> ↗</span>}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-coal-line">
        <p className="label mx-auto max-w-[1440px] px-4 py-5 text-paper/50 md:px-8">{t.copyright}</p>
      </div>
    </footer>
  );
}
