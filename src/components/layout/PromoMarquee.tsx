"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MarqueeItem } from "@/lib/promo";

interface PromoMarqueeProps {
  items: MarqueeItem[];
  className?: string;
}

export function PromoMarquee({ items, className }: PromoMarqueeProps) {
  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <div
      className={cn(
        "relative z-40 border-b border-cyan/20 bg-gradient-to-r from-[#0a1628] via-[#121a2e] to-[#1a1030] text-pure-paper",
        className
      )}
      role="region"
      aria-label="Promotional highlights"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0a1628] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#1a1030] to-transparent" />

      <div className="overflow-hidden py-2.5">
        <div className="marquee-track flex w-max items-center gap-8 px-4">
          {loop.map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              href={item.href}
              className="group flex shrink-0 items-center gap-2 text-sm font-semibold tracking-wide transition-colors hover:text-cyan"
            >
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  item.kind === "new"
                    ? "bg-cyan/20 text-cyan"
                    : "bg-magenta/20 text-magenta"
                )}
              >
                {item.kind === "new" ? "New" : "Promo"}
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
              <span className="text-cyan opacity-0 transition-opacity group-hover:opacity-100">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
