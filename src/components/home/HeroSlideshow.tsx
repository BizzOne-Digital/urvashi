"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  src: string;
  alt: string;
}

const AUTOPLAY_MS = 4000;

interface HeroSlideshowProps {
  slides: HeroSlide[];
  className?: string;
}

export function HeroSlideshow({ slides, className }: HeroSlideshowProps) {
  const [active, setActive] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      setActive(index % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (slides.length <= 1) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const timer = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            index === active ? "opacity-100 z-[1]" : "opacity-0 z-0"
          )}
          aria-hidden={index !== active}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      ))}

      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#050508]/80 via-transparent to-[#050508]/20" />

      {slides.length > 1 && (
        <div className="absolute bottom-3 right-3 z-[3] flex gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === active
                  ? "w-6 bg-cyan shadow-[0_0_8px_rgba(13,151,252,0.6)]"
                  : "w-2 bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
