import { SITE_HIGHLIGHTS } from "@/lib/site-highlights";
import { cn } from "@/lib/utils";

interface HighlightItem {
  label: string;
  detail?: string;
}

interface HighlightStripProps {
  items?: HighlightItem[];
  className?: string;
}

export function HighlightStrip({ items = [...SITE_HIGHLIGHTS], className }: HighlightStripProps) {
  return (
    <div
      className={cn(
        "relative border-y border-white/10 bg-[#080a12]/90 py-4 backdrop-blur-md",
        className
      )}
      data-reveal
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan/5 via-transparent to-magenta/5" aria-hidden />
      <div className="container-wide flex flex-wrap items-center justify-center gap-3 sm:gap-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 transition-all hover:border-cyan/40 hover:bg-white/[0.07] hover:shadow-[0_0_20px_rgba(13,151,252,0.15)]"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan/30 to-magenta/30 text-[10px] font-bold text-pure-paper"
              aria-hidden
            >
              ✦
            </span>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-pure-paper">{item.label}</p>
              {item.detail && (
                <p className="text-[10px] text-chrome-mid group-hover:text-chrome-light">{item.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
