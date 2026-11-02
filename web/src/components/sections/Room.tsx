import { en } from "@/content/en";
import Reveal from "../Reveal";
import SectionHead from "../SectionHead";
import RoomReplay from "./RoomReplay";

const t = en.room;

export default function Room() {
  return (
    <section id="room" aria-labelledby="room-title" className="border-b border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 lg:py-20">
        <SectionHead id="room-title" eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
        <Reveal className="mt-12 lg:mt-16">
          <RoomReplay />
          <p className="label mt-4 text-ink-2">{t.shownIn}</p>
        </Reveal>
      </div>
    </section>
  );
}
