import { en } from "@/content/en";
import CanaryMark from "../CanaryMark";
import SplitText from "../reactbits/SplitText";
import WaitlistForm from "./WaitlistForm";

const t = en.waitlist;

export default function Waitlist() {
  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="relative overflow-hidden border-b border-ink bg-canary">
      <CanaryMark className="pointer-events-none absolute -bottom-16 -right-10 size-[22rem] text-ink/[0.07] md:size-[30rem]" />
      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-6">
          <p className="label mb-6 text-ink/70">{t.eyebrow}</p>
          <h2 id="waitlist-title" className="display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.88]">
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
          <p className="mt-6 max-w-[40ch] text-lg leading-snug text-ink/80">{t.body}</p>
        </div>
        <div className="self-end lg:col-span-5 lg:col-start-8">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
