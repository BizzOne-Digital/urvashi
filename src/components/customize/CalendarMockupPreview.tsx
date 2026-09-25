"use client";

import Image from "next/image";
import { CALENDAR_MONTHS } from "@/lib/calendar-customize";
import { cn } from "@/lib/utils";

interface CalendarMockupPreviewProps {
  productName?: string;
  baseImageSrc: string;
  /** One preview URL per month (index 0 = January). Use empty string for missing months. */
  monthImageUrls: string[];
  selectedMonth: number;
  onSelectMonth: (monthIndex: number) => void;
  disclaimer?: string;
  className?: string;
}

export function CalendarMockupPreview({
  productName,
  baseImageSrc,
  monthImageUrls,
  selectedMonth,
  onSelectMonth,
  disclaimer = "Rough draft only — final placement, colour, and sizing may vary slightly.",
  className,
}: CalendarMockupPreviewProps) {
  const safeMonth = Math.min(Math.max(selectedMonth, 0), CALENDAR_MONTHS.length - 1);
  const activeImage = monthImageUrls[safeMonth];
  const filledCount = monthImageUrls.filter(Boolean).length;

  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">Calendar preview</p>
      {productName && (
        <p className="mt-2 font-display text-lg font-semibold text-pure-paper">{productName}</p>
      )}

      <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#0a0c14]/80 p-4 shadow-[0_0_40px_rgba(6,94,229,0.15)]">
        <div className="relative mx-auto max-w-md">
          <div className="mb-2 flex justify-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="h-3 w-3 rounded-full border border-white/25 bg-gradient-to-b from-chrome-light/40 to-chrome-mid/30"
              />
            ))}
          </div>

          <div className="relative overflow-hidden rounded-lg border border-white/15 bg-gradient-to-b from-[#1a1d28] to-[#0f1118] shadow-lg">
            <div className="relative aspect-[4/5] overflow-hidden bg-white">
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImage}
                  alt={`${CALENDAR_MONTHS[safeMonth]} artwork`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] p-6 text-center">
                  <p className="text-sm font-semibold text-carbon/70">{CALENDAR_MONTHS[safeMonth]}</p>
                  <p className="text-xs text-chrome-mid">Upload a photo for this month</p>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-4 pb-3 pt-10">
                <p className="font-display text-lg font-bold text-pure-paper">{CALENDAR_MONTHS[safeMonth]}</p>
                <p className="text-[10px] uppercase tracking-widest text-chrome-light/90">Desk calendar page</p>
              </div>
            </div>

            <div className="h-2 bg-gradient-to-r from-chrome-mid/50 via-chrome-light/30 to-chrome-mid/50" />
          </div>

          <div className="pointer-events-none absolute -bottom-2 left-1/2 h-8 w-[88%] -translate-x-1/2 rounded-b-xl bg-[#12141c]/90 shadow-[0_12px_24px_rgba(0,0,0,0.45)]" />

          <div className="relative -mt-1 overflow-hidden rounded-lg opacity-90">
            <Image
              src={baseImageSrc}
              alt="Desk calendar stand"
              width={400}
              height={120}
              className="h-auto w-full object-contain opacity-40"
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-chrome-mid">
            All 12 months ({filledCount}/12 added)
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {CALENDAR_MONTHS.map((month, index) => {
              const url = monthImageUrls[index];
              const isActive = index === safeMonth;

              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => onSelectMonth(index)}
                  className={cn(
                    "group overflow-hidden rounded-md border text-left transition-all",
                    isActive
                      ? "border-cyan ring-2 ring-cyan/40"
                      : "border-white/10 hover:border-cyan/40"
                  )}
                >
                  <div className="relative aspect-square bg-[#12141c]">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={month} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-white/5 p-1 text-center text-[9px] text-chrome-mid">
                        {month.slice(0, 3)}
                      </div>
                    )}
                  </div>
                  <p className="truncate px-1 py-0.5 text-[9px] text-chrome-light group-hover:text-cyan">
                    {month.slice(0, 3)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-chrome-mid">{disclaimer}</p>
      {filledCount > 0 && filledCount < 12 && (
        <p className="mt-1 text-xs text-yellow-300/90">
          Add photos for all 12 months to complete your calendar preview.
        </p>
      )}
    </div>
  );
}
