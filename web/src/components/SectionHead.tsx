import SplitText from "./reactbits/SplitText";

/** Eyebrow, display heading and intro shared by every landing-page section. */
export default function SectionHead({
  id,
  eyebrow,
  title,
  intro,
  className = "",
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
}) {
  return (
    <div className={`grid gap-6 lg:grid-cols-12 lg:gap-10 ${className}`}>
      <p className="label text-ink-2 lg:col-span-3 lg:pt-3">{eyebrow}</p>
      <div className="lg:col-span-9">
        <h2 id={id} className="display max-w-[22ch] text-[clamp(2.25rem,5.2vw,4.75rem)] leading-[0.9]">
          <SplitText
            text={title}
            tag="span"
            textAlign="left"
            splitType="words"
            mask
            delay={35}
            duration={0.9}
            ease="expo.out"
            from={{ opacity: 0, yPercent: 105 }}
            to={{ opacity: 1, yPercent: 0 }}
          />
        </h2>
        {intro && <p className="mt-6 max-w-[58ch] text-lg leading-snug text-ink-2">{intro}</p>}
      </div>
    </div>
  );
}
