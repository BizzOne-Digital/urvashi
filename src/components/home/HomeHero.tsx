"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Container } from "@/components/ui/Container";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { cn } from "@/lib/utils";

interface HomeHeroProps {
  tagline?: string;
}

const HERO_SLIDES = [
  {
    src: "/images/hero/slide-products.png",
    alt: "Custom printed mugs, tumblers, keychains, and ornaments",
  },
  {
    src: "/images/hero/slide-stationery.png",
    alt: "Custom pens, notebooks, mousepads, and office accessories",
  },
  {
    src: "/images/hero/slide-apparel.png",
    alt: "Custom hoodies, caps, tote bags, and streetwear apparel",
  },
  {
    src: "/images/hero/slide-drinkware.png",
    alt: "Custom mugs, tumblers, and drinkware with vibrant sublimation prints",
  },
] as const;

const FEATURES = [
  { label: "Quality", desc: "Vivid CMYK saturation" },
  { label: "Reliability", desc: "Zero minimum orders" },
  { label: "Innovation", desc: "Pro ink refills & media" },
] as const;

const CMYK_DOTS = [
  { color: "bg-cyan", shadow: "shadow-[0_0_12px_rgba(13,151,252,0.9)]" },
  { color: "bg-yellow", shadow: "shadow-[0_0_12px_rgba(243,199,34,0.9)]" },
  { color: "bg-magenta", shadow: "shadow-[0_0_12px_rgba(222,64,152,0.9)]" },
  { color: "bg-royal-blue", shadow: "shadow-[0_0_12px_rgba(6,94,229,0.9)]" },
] as const;

export function HomeHero({ tagline = "Your idea. Your style. Printed with purpose." }: HomeHeroProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-hero-badge]", { opacity: 0, y: 24, duration: 0.9, ease: "power3.out", delay: 0.15 });
      gsap.from("[data-hero-line]", {
        opacity: 0,
        y: 48,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
        delay: 0.25,
      });
      gsap.from("[data-hero-cta]", {
        opacity: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.65,
      });
      gsap.from("[data-hero-visual]", {
        opacity: 0,
        scale: 0.92,
        x: 40,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.35,
      });
      gsap.from("[data-hero-feature]", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.9,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative min-h-[100vh] overflow-hidden bg-[#050508] text-pure-paper"
    >
      {/* Aurora background */}
      <div className="aurora-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="gradient-orb gradient-orb-cyan pointer-events-none absolute -left-[20%] top-[10%] h-[55vh] w-[55vh]" aria-hidden />
      <div className="gradient-orb gradient-orb-magenta pointer-events-none absolute -right-[15%] top-[20%] h-[50vh] w-[50vh]" aria-hidden />
      <div className="gradient-orb gradient-orb-blue pointer-events-none absolute bottom-[10%] left-[30%] h-[40vh] w-[40vh]" aria-hidden />

      {/* Grid overlay */}
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-[0.4]" aria-hidden />

      <div className="cmyk-line absolute left-0 top-0 z-20 w-full" aria-hidden />

      <Container className="relative z-10 flex min-h-[100vh] min-w-0 max-w-[1400px] flex-col pb-8 pt-32 sm:pt-36 lg:pb-10 lg:pt-40">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Copy */}
          <div className="min-w-0">
            <div
              data-hero-badge
              className="inline-flex items-center gap-3 rounded-full border border-cyan/25 bg-white/5 px-4 py-2 backdrop-blur-md"
            >
              <span className="flex gap-1.5" aria-hidden>
                {CMYK_DOTS.map((dot) => (
                  <span key={dot.color} className={cn("h-2.5 w-2.5 rounded-full", dot.color, dot.shadow)} />
                ))}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan sm:text-xs">
                Custom Printing & Ink Supplies Studio
              </span>
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
              <span data-hero-line className="block text-pure-paper">Precision</span>
              <span
                data-hero-line
                className="block bg-gradient-to-r from-cyan via-[#4d9fff] to-magenta bg-clip-text text-transparent animate-gradient-shift"
              >
                Sublimation & Ink
              </span>
              <span data-hero-line className="block text-pure-paper">Supplies</span>
            </h1>

            <p data-hero-line className="mt-6 max-w-xl text-base leading-relaxed text-chrome-light sm:text-lg">
              Custom streetwear apparel, mugs, tumblers, keychains, ornaments, and high-density CMYK sublimation
              inks — personalized for gifts, business, and everyday life.
            </p>
            <p data-hero-line className="mt-2 text-sm text-cyan/80">{tagline}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                data-hero-cta
                href="/shop"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-pure-paper"
              >
                <span
                  className="absolute inset-0 bg-gradient-to-r from-cyan via-royal-blue to-magenta transition-transform duration-500 group-hover:scale-105"
                  aria-hidden
                />
                <span
                  className="absolute inset-0 bg-gradient-to-r from-cyan via-royal-blue to-magenta opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70"
                  aria-hidden
                />
                <span className="relative z-10 flex items-center gap-2">
                  Explore catalog
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </Link>
              <Link
                data-hero-cta
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-pure-paper/25 bg-white/5 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-pure-paper backdrop-blur-sm transition-all duration-300 hover:border-cyan/50 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(13,151,252,0.2)]"
              >
                Get custom quote
              </Link>
            </div>
          </div>

          {/* Visual showcase */}
          <div data-hero-visual className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-cyan/45 via-royal-blue/30 to-magenta/45 blur-2xl animate-pulse-glow" aria-hidden />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c14]/80 p-1 shadow-[0_0_60px_rgba(6,94,229,0.25)] backdrop-blur-sm">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl sm:aspect-[16/11]">
                <HeroSlideshow slides={[...HERO_SLIDES]} className="absolute inset-0" />
              </div>

              <div
                className="absolute bottom-4 left-4 z-10 flex items-center gap-3 rounded-xl border border-cyan/30 bg-[#0d111c]/90 px-4 py-3 shadow-[0_0_24px_rgba(13,151,252,0.15)] backdrop-blur-md animate-float"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan to-magenta text-lg font-bold"
                  aria-hidden
                >
                  ✦
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan">Sublimation & inks</p>
                  <p className="text-sm font-semibold text-pure-paper">CMYK high density</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-10 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3 sm:gap-6 lg:mt-14">
          {FEATURES.map((item) => (
            <div
              key={item.label}
              data-hero-feature
              className="group rounded-xl border border-white/8 bg-white/[0.03] px-5 py-4 transition-all duration-300 hover:border-cyan/30 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(13,151,252,0.08)]"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-cyan">{item.label}</p>
              <p className="mt-1 text-sm text-chrome-light transition-colors group-hover:text-pure-paper">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
