"use client";

import Image from "next/image";
import { DEFAULT_PRINT_AREA, getCollageGridLayout, type PrintAreaRect } from "@/lib/mockup-preview";
import { cn } from "@/lib/utils";

interface ProductMockupPreviewProps {
  productName?: string;
  baseImageSrc: string;
  artworkUrls: string[];
  printArea?: PrintAreaRect;
  disclaimer?: string;
  className?: string;
  emptyHint?: string;
}

export function ProductMockupPreview({
  productName,
  baseImageSrc,
  artworkUrls,
  printArea = DEFAULT_PRINT_AREA,
  disclaimer = "Rough draft only — final placement, colour, and sizing may vary slightly.",
  className,
  emptyHint = "Your design will appear on the product here",
}: ProductMockupPreviewProps) {
  const visibleUrls = artworkUrls.filter(Boolean);
  const { cols, rows } = getCollageGridLayout(visibleUrls.length);
  const slots = Math.max(cols * rows, 1);
  const collageUrls = visibleUrls.slice(0, slots);

  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">Rough draft preview</p>
      {productName && (
        <p className="mt-2 font-display text-lg font-semibold text-pure-paper">{productName}</p>
      )}

      <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#0a0c14]/80 p-4 shadow-[0_0_40px_rgba(6,94,229,0.15)]">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-[#12141c] to-[#0a0c14]">
          <Image
            src={baseImageSrc}
            alt={productName ? `${productName} mockup` : "Product mockup"}
            fill
            className="object-contain p-6"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          <div
            className="absolute overflow-hidden rounded-sm border border-dashed border-cyan/40 bg-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.15)]"
            style={{
              left: `${printArea.x}%`,
              top: `${printArea.y}%`,
              width: `${printArea.width}%`,
              height: `${printArea.height}%`,
            }}
          >
            {collageUrls.length > 0 ? (
              <div
                className="grid h-full w-full gap-px bg-white/20 p-px"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
              >
                {collageUrls.map((url, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt={`Artwork ${index + 1}`}
                    className="h-full w-full bg-white object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center p-2 text-center text-[10px] leading-snug text-chrome-mid sm:text-xs">
                {emptyHint}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-chrome-mid">{disclaimer}</p>
      {visibleUrls.length > 1 && (
        <p className="mt-1 text-xs text-cyan">
          Showing {visibleUrls.length} image{visibleUrls.length === 1 ? "" : "s"} as a collage rough draft.
        </p>
      )}
    </div>
  );
}
