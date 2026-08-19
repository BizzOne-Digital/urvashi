"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Logo } from "@/components/ui/Logo";
const INTRO_KEY = "dpm_intro_seen";

interface CinematicIntroProps {
  logoPath: string;
  shortName: string;
  enabled?: boolean;
}

export function CinematicIntro({ logoPath, shortName, enabled = true }: CinematicIntroProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);

  const finish = () => {
    sessionStorage.setItem(INTRO_KEY, "1");
    setVisible(false);
  };

  useEffect(() => {
    if (!enabled) return;

    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(INTRO_KEY);

    if (seen) return;

    setMounted(true);
    setVisible(true);
  }, [enabled]);

  useEffect(() => {
    if (!visible || !mounted || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: finish,
        defaults: { ease: "power3.inOut" },
      });

      if (reducedMotion.current) {
        tl.fromTo(containerRef.current, { opacity: 1 }, { opacity: 0, duration: 0.25, delay: 0.05 });
        return;
      }

      tl.set(".intro-ribbon", { scaleX: 0, transformOrigin: "left center" })
        .set(".intro-logo", { scale: 0.8, opacity: 0 })
        .set(".intro-tagline", { y: 20, opacity: 0 })
        .to(".intro-ribbon-cyan", { scaleX: 1, duration: 0.6 }, 0)
        .to(".intro-ribbon-magenta", { scaleX: 1, duration: 0.6 }, 0.15)
        .to(".intro-ribbon-yellow", { scaleX: 1, duration: 0.6 }, 0.3)
        .to(".intro-logo", { scale: 1, opacity: 1, duration: 0.8 }, 0.5)
        .to(".intro-tagline", { y: 0, opacity: 1, duration: 0.5 }, 1.0)        .to(containerRef.current, { opacity: 0, duration: 0.6, delay: 0.8 });
    }, containerRef);

    return () => ctx.revert();
  }, [visible, mounted]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink-black text-pure-paper"
      aria-live="polite"
      aria-label="Site introduction"
    >
      <button
        type="button"
        onClick={finish}
        className="absolute right-4 top-4 z-10 rounded-sm border border-pure-paper/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-pure-paper transition-colors hover:bg-pure-paper/10"
      >
        Skip
      </button>

      <div className="absolute inset-x-0 top-1/3 space-y-3 px-8">
        <div className="intro-ribbon intro-ribbon-cyan h-1 w-full bg-cyan" />
        <div className="intro-ribbon intro-ribbon-magenta h-1 w-4/5 bg-magenta" />
        <div className="intro-ribbon intro-ribbon-yellow h-1 w-3/5 bg-yellow" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        <div className="intro-logo">
          <Logo src={logoPath} alt={shortName} href={undefined} priority variant="default" imageClassName="max-w-[220px]" plaqueClassName="p-4" />
        </div>

        <p className="intro-tagline text-center text-sm uppercase tracking-[0.3em] text-chrome-light">
          Ink lab · Custom prints
        </p>
      </div>    </div>
  );
}
