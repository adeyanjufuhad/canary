import { en } from "@/content/en";
import Reveal from "../Reveal";
import SectionHead from "../SectionHead";

const t = en.gap;

const verdictTone = {
  neutral: "text-held",
  broken: "bg-broken px-2 py-0.5 text-paper",
} as const;

export default function Gap() {
  return (
    <section aria-labelledby="gap-title" className="border-b border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 lg:py-20">
        <SectionHead id="gap-title" eyebrow={t.eyebrow} title={t.title} />

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12">
          <Reveal className="space-y-4 text-lg leading-snug text-ink-2 lg:col-span-4 lg:col-start-4">
            {t.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>

          <Reveal delay={120} className="min-w-0 lg:col-span-5">
            <figure className="bg-coal text-paper ring-1 ring-ink">
              <figcaption className="label flex h-9 items-center border-b border-coal-line px-3 text-paper/70" translate="no">
                {t.file}
              </figcaption>
              <pre className="overflow-x-auto py-3 font-mono text-[13px] leading-6">
                {t.code.map((line) => (
                  <code
                    key={line.n}
                    className={`block whitespace-pre pr-4 ${"flag" in line ? "border-l-2 border-canary bg-canary/10" : "border-l-2 border-transparent"}`}
                  >
                    <span aria-hidden="true" className="inline-block w-10 select-none pr-3 text-right text-paper/35">
                      {line.n}
                    </span>
                    {line.text}
                  </code>
                ))}
              </pre>
              <p className="border-t border-coal-line px-4 py-3 text-sm text-canary">{t.flagNote}</p>
            </figure>

            <ul className="mt-4 divide-y divide-rule border-y border-ink">
              {t.results.map((r) => (
                <li key={r.tool} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <span className="label text-ink-2">{r.tool}</span>
                  <span className={`font-mono text-sm ${verdictTone[r.tone]}`}>{r.verdict}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
