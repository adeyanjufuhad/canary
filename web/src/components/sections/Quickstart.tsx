import { en } from "@/content/en";
import CopyButton from "../CopyButton";
import Reveal from "../Reveal";
import SectionHead from "../SectionHead";

const t = en.quickstart;

export default function Quickstart() {
  return (
    <section id="quickstart" aria-labelledby="quickstart-title" className="border-b border-ink bg-paper-2/60">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 lg:py-20">
        <SectionHead id="quickstart-title" eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

        <ol className="mt-12 grid gap-px bg-ink ring-1 ring-ink md:grid-cols-2 lg:mt-16">
          {t.steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={(i % 2) * 90} className="flex min-w-0 flex-col bg-paper p-5 md:p-8">
              <p className="flex items-baseline gap-4">
                <span className="display text-4xl leading-none text-canary-ink">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-xl font-semibold">{step.title}</span>
              </p>
              {step.code && (
                <div className="mt-6 bg-coal text-paper">
                  <div className="flex h-10 items-center justify-between border-b border-coal-line pl-3 pr-1.5">
                    <span className="label text-paper/50">{step.lang}</span>
                    <CopyButton text={step.code} label={t.copy} doneLabel={t.copied} />
                  </div>
                  <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-6" translate="no">
                    <code>
                      {step.lang === "bash"
                        ? step.code.split("\n").map((line) => (
                            <span key={line} className="block">
                              <span aria-hidden="true" className="select-none text-canary">$ </span>
                              {line}
                            </span>
                          ))
                        : step.code}
                    </code>
                  </pre>
                </div>
              )}
              {"note" in step && <p className="mt-4 max-w-[48ch] leading-snug text-ink-2">{step.note}</p>}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
