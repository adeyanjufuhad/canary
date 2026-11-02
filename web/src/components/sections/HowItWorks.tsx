import { en } from "@/content/en";
import Reveal from "../Reveal";
import SectionHead from "../SectionHead";

const t = en.how;

export default function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="border-b border-ink bg-paper-2/60">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 lg:py-20">
        <SectionHead id="how-title" eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

        <ol className="mt-12 border-t border-ink lg:mt-16">
          {t.steps.map((step, i) => (
            <Reveal
              as="li"
              key={step.n}
              delay={i * 80}
              className="grid gap-4 border-b border-rule py-8 md:grid-cols-12 md:gap-8 lg:py-10"
            >
              <span aria-hidden="true" className="display text-[clamp(3rem,6vw,5.5rem)] leading-[0.8] text-ink/15 md:col-span-2 lg:col-span-3">
                {step.n}
              </span>
              <h3 className="display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[0.95] md:col-span-4 lg:col-span-3">
                {step.title}
              </h3>
              <div className="md:col-span-6">
                <p className="max-w-[52ch] text-lg leading-snug text-ink-2">{step.body}</p>
                <p className="mt-4 inline-block max-w-full break-words bg-paper px-3 py-2 font-mono text-[13px] text-ink ring-1 ring-rule">
                  {step.sample}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
