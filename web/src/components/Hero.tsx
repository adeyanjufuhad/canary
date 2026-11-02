import { en } from "@/content/en";
import { GITHUB_URL } from "@/lib/site";
import DecryptedText from "./reactbits/DecryptedText";
import Magnet from "./reactbits/Magnet";
import SplitText from "./reactbits/SplitText";
import HeroGlow from "./HeroGlow";
import HeroVisual from "./HeroVisual";

const t = en.hero;
const h = t.headline;
const chatApps = new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(t.chatApps);

function Line({ text, index }: { text: string; index: number }) {
  return (
    <SplitText
      text={text}
      tag="span"
      textAlign="left"
      splitType="words"
      mask
      trigger="load"
      delay={45}
      duration={0.95}
      ease="expo.out"
      from={{ opacity: 0, yPercent: 105 }}
      to={{ opacity: 1, yPercent: 0, delay: 0.1 + index * 0.09 }}
    />
  );
}

export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden border-b border-ink">
      {/* Split Text hides the headline until its script runs; show it when scripts are off. */}
      <noscript>
        <style>{".split-parent{visibility:visible!important}"}</style>
      </noscript>
      <HeroGlow />

      <div className="relative mx-auto grid max-w-[1440px] gap-12 px-4 pb-14 pt-10 md:px-8 md:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-20 lg:pt-20">
        <div className="flex flex-col lg:col-span-7">
          <p className="label mb-6 text-ink-2 md:mb-8">
            <DecryptedText
              text={t.eyebrow}
              animateOn="view"
              sequential
              speed={28}
              revealDirection="start"
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#·—"
              encryptedClassName="text-canary-ink"
            />
          </p>

          <h1 id="hero-title" className="display text-[clamp(3rem,6.9vw,7.5rem)] leading-[0.86]">
            <span className="block">
              <Line text={h.line1} index={0} />
            </span>
            <span className="block">
              <Line text={h.line2} index={1} />
            </span>
            <span className="block">
              <span className="relative inline-block">
                <span
                  aria-hidden="true"
                  className="animate-slab absolute -inset-x-[0.06em] inset-y-[0.04em] bg-canary"
                />
                <span className="relative">
                  <Line text={h.accent} index={2} />
                </span>
              </span>{" "}
              <Line text={h.line3} index={2} />
            </span>
            <span className="block">
              <Line text={h.line4} index={3} />
            </span>
          </h1>

          <p className="mt-8 max-w-[36rem] text-lg leading-snug text-ink-2 md:text-xl">{t.subhead}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Magnet padding={40} magnetStrength={6} maxOffset={8}>
              <a
                href={GITHUB_URL}
                className="label inline-flex h-12 items-center gap-3 bg-ink px-6 text-[12px] text-paper ring-1 ring-ink transition-colors hover:bg-canary hover:text-ink"
              >
                {t.ctaGithub} <span aria-hidden="true">↗</span>
              </a>
            </Magnet>
            <Magnet padding={40} magnetStrength={6} maxOffset={8}>
              <a
                href="#room"
                className="label inline-flex h-12 items-center gap-3 bg-paper/60 px-6 text-[12px] text-ink ring-1 ring-ink backdrop-blur-sm transition-colors hover:bg-canary"
              >
                <span aria-hidden="true" className="text-[9px]">▶</span> {t.ctaDemo}
              </a>
            </Magnet>
          </div>

          <p className="label mt-6 max-w-[36rem] normal-case tracking-normal text-[12px] text-ink-2">
            {t.worksIn} <span className="text-ink">{chatApps}</span>.
          </p>
        </div>

        <div className="lg:col-span-5 lg:pt-4">
          <HeroVisual />
        </div>
      </div>

      <dl className="relative grid grid-cols-2 border-t border-ink bg-paper/70 backdrop-blur-sm lg:grid-cols-4">
        {t.stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col-reverse gap-1 px-4 py-5 md:px-8 ${i % 2 ? "border-l border-rule" : ""} ${i > 1 ? "border-t border-rule lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
          >
            <dt className="label text-ink-2">{stat.label}</dt>
            <dd className="display text-[clamp(2rem,4vw,3.5rem)] leading-none">
              {"accent" in stat && stat.accent ? <span className="bg-canary px-1.5">{stat.value}</span> : stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
