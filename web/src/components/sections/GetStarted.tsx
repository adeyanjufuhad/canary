import { en } from "@/content/en";
import { GITHUB_URL } from "@/lib/site";
import CanaryMark from "../CanaryMark";
import SplitText from "../reactbits/SplitText";

const t = en.getStarted;

export default function GetStarted() {
  return (
    <section id="get-started" aria-labelledby="get-started-title" className="relative overflow-hidden border-b border-ink bg-canary">
      <CanaryMark className="pointer-events-none absolute -bottom-16 -right-10 size-[22rem] text-ink/[0.07] md:size-[30rem]" />
      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <p className="label mb-6 text-ink/70">{t.eyebrow}</p>
          <h2 id="get-started-title" className="display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.88]">
            <SplitText
              text={t.title}
              tag="span"
              textAlign="left"
              splitType="words"
              mask
              delay={40}
              duration={0.9}
              ease="expo.out"
              from={{ opacity: 0, yPercent: 105 }}
              to={{ opacity: 1, yPercent: 0 }}
            />
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg leading-snug text-ink/80">{t.body}</p>
        </div>
        <div className="flex flex-wrap gap-3 self-end lg:col-span-5 lg:justify-end">
          <a
            href={GITHUB_URL}
            className="label inline-flex h-12 items-center gap-3 bg-ink px-6 text-[12px] text-paper ring-1 ring-ink transition-colors hover:bg-paper hover:text-ink"
          >
            {t.github} <span aria-hidden="true">↗</span>
          </a>
          <a
            href="#quickstart"
            className="label inline-flex h-12 items-center gap-3 px-6 text-[12px] text-ink ring-1 ring-ink transition-colors hover:bg-ink hover:text-canary"
          >
            {t.guide} <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </section>
  );
}
