"use client";

import { useEffect, useRef } from "react";

/** Soft canary glow drifting on the paper; leans a little toward the cursor. */
export default function HeroGlow() {
  const leanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = leanRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;

    const tick = () => {
      current.x += (target.x - current.x) * 0.04;
      current.y += (target.y - current.y) * 0.04;
      el.style.transform = `translate3d(${current.x.toFixed(1)}px, ${current.y.toFixed(1)}px, 0)`;
      raf =
        Math.abs(target.x - current.x) > 0.2 || Math.abs(target.y - current.y) > 0.2
          ? requestAnimationFrame(tick)
          : 0;
    };

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 80;
      target.y = (e.clientY / window.innerHeight - 0.5) * 60;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div ref={leanRef} className="absolute inset-0 will-change-transform">
        <div
          className="animate-drift absolute left-[38%] top-[-10%] h-[90%] w-[70%] rounded-full opacity-60 blur-[90px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,214,10,0.85), rgba(255,214,10,0.35) 55%, rgba(255,214,10,0) 100%)",
          }}
        />
      </div>
    </div>
  );
}
