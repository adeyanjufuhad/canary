"use client";

import { useEffect, useRef, useState } from "react";
import { en } from "@/content/en";

const t = en.heroVisual;

/** Google Flow (Veo 3.1) take, cross-faded into a seamless 7.4 s loop. Null falls back to the CSS shaft. */
const CLIP: { mp4: string; webm?: string; poster: string } | null = {
  mp4: "/hero/shaft.mp4",
  webm: "/hero/shaft.webm",
  poster: "/hero/shaft-poster.jpg",
};

const corner = "absolute size-3 border-canary";

export default function HeroVisual() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // mirrors the video's own play/pause events
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, []);

  return (
    <div className="relative">
      {/* tilted canary slab behind the window */}
      <div
        aria-hidden="true"
        className="absolute -right-3 -bottom-4 left-8 top-10 -rotate-[4deg] bg-canary ring-1 ring-ink lg:-right-6 lg:left-12"
      />

      <figure className="relative bg-coal text-paper ring-1 ring-ink">
        <figcaption className="label flex h-9 items-center justify-between border-b border-coal-line px-3 text-paper/70">
          <span>{t.address}</span>
          {CLIP ? (
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? t.pause : t.play}
              className="-mr-2 flex h-9 items-center gap-2 px-2 uppercase text-paper transition-colors hover:text-canary focus-visible:outline-canary"
            >
              <span aria-hidden="true" className={`size-1.5 rounded-full ${playing ? "bg-broken animate-rec" : "bg-paper/40"}`} />
              {t.rec}
              <svg aria-hidden="true" viewBox="0 0 12 12" className="size-2.5">
                {playing ? <path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /> : <path d="M2 1l9 5-9 5z" fill="currentColor" />}
              </svg>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-paper">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-broken animate-rec" />
              {t.rec}
            </span>
          )}
        </figcaption>

        <div className="relative aspect-video overflow-hidden lg:aspect-square">
          {CLIP ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              poster={CLIP.poster}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={t.videoLabel}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            >
              {CLIP.webm && <source src={CLIP.webm} type="video/webm" />}
              <source src={CLIP.mp4} type="video/mp4" />
            </video>
          ) : (
            <ShaftPlaceholder />
          )}

          {/* viewfinder chrome */}
          <span aria-hidden="true" className={`${corner} left-3 top-3 border-l border-t`} />
          <span aria-hidden="true" className={`${corner} right-3 top-3 border-r border-t`} />
          <span aria-hidden="true" className={`${corner} bottom-3 left-3 border-b border-l`} />
          <span aria-hidden="true" className={`${corner} bottom-3 right-3 border-b border-r`} />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 opacity-50"
          >
            <span className="absolute left-1/2 top-0 h-full w-px bg-paper" />
            <span className="absolute left-0 top-1/2 h-px w-full bg-paper" />
          </span>
        </div>

        <div className="label grid grid-cols-3 border-t border-coal-line text-paper/60">
          <span className="px-3 py-2">{t.readouts[0]}</span>
          <span className="border-x border-coal-line px-3 py-2">{t.readouts[1]}</span>
          <span className="px-3 py-2 text-canary">{t.readouts[2]}</span>
        </div>
      </figure>
    </div>
  );
}

/** Stand-in until the real clip lands: a glow down a dark shaft, pure CSS. */
function ShaftPlaceholder() {
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-coal">
      <div className="absolute inset-x-[22%] inset-y-0 bg-gradient-to-b from-coal-2 via-coal to-coal" />
      <div className="absolute inset-y-0 left-[22%] w-px bg-coal-line" />
      <div className="absolute inset-y-0 right-[22%] w-px bg-coal-line" />
      <div
        className="animate-shaft absolute left-1/2 top-[58%] size-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,214,10,0.95), rgba(255,214,10,0.25) 60%, transparent)",
        }}
      />
      <div className="absolute left-1/2 top-[58%] size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-canary shadow-[0_0_24px_6px_rgba(255,214,10,0.8)]" />
    </div>
  );
}
