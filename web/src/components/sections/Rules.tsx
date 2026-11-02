import { en } from "@/content/en";
import Reveal from "../Reveal";
import SectionHead from "../SectionHead";

const t = en.rules;

export default function Rules() {
  return (
    <section id="rules" aria-labelledby="rules-title" className="border-b border-ink bg-paper-2/60">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 lg:py-20">
        <SectionHead id="rules-title" eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

        <div className="mt-12 border-t border-ink lg:mt-16">
          <div aria-hidden="true" className="label hidden grid-cols-12 gap-8 border-b border-rule py-3 text-ink-2 md:grid">
            <span className="col-span-2" />
            <span className="col-span-5">{t.columns.rule}</span>
            <span className="col-span-5">{t.columns.attack}</span>
          </div>
          <ul>
            {t.items.map((item, i) => (
              <Reveal
                as="li"
                key={item.area}
                delay={(i % 3) * 70}
                className="group grid gap-2 border-b border-rule py-6 md:grid-cols-12 md:gap-8"
              >
                <p className="label pt-1.5 text-ink-2 md:col-span-2">{item.area}</p>
                <p className="text-xl font-semibold leading-snug md:col-span-5 md:text-2xl">
                  <span className="sr-only">{t.columns.rule}: </span>
                  <span className="bg-[linear-gradient(var(--color-canary),var(--color-canary))] bg-[length:0%_40%] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_40%]">
                    “{item.rule}”
                  </span>
                </p>
                <p className="flex gap-3 leading-snug text-ink-2 md:col-span-5 md:pt-1">
                  <span aria-hidden="true" className="font-mono text-broken">→</span>
                  <span>
                    <span className="sr-only">{t.columns.attack}: </span>
                    {item.attack}
                  </span>
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
