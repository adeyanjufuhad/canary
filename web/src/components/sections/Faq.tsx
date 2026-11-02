import { en } from "@/content/en";
import SectionHead from "../SectionHead";

const t = en.faq;

export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-b border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 lg:py-20">
        <SectionHead id="faq-title" eyebrow={t.eyebrow} title={t.title} />

        <div className="mt-12 grid lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="border-t border-ink lg:col-span-9 lg:col-start-4">
            {t.items.map((item) => (
              <details key={item.q} className="group border-b border-rule">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold leading-snug transition-colors hover:text-canary-ink md:text-xl [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-45">
                    <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </summary>
                <p className="max-w-[62ch] pb-6 leading-relaxed text-ink-2">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
