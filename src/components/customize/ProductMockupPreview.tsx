"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import { DEFAULT_PRINT_AREA, getCollageGridLayout, type PrintAreaRect } from "@/lib/mockup-preview";
import {
  artworkTransformToCss,
  DEFAULT_ARTWORK_TRANSFORM,
  FILL_PRINT_AREA_TRANSFORM,
  type ArtworkTransform,
} from "@/lib/artwork-transform";
import { cn } from "@/lib/utils";

interface ProductMockupPreviewProps {
  productName?: string;
  baseImageSrc: string;
  artworkUrls: string[];
  printArea?: PrintAreaRect;
  roundedPrintArea?: boolean;
  borderRadius?: string;
  disclaimer?: string;
  className?: string;
  emptyHint?: string;
  interactive?: boolean;
  artworkTransform?: ArtworkTransform;
  onArtworkTransformChange?: (transform: ArtworkTransform) => void;
}

const FIT_CLASS: Record<ArtworkTransform["fit"], string> = {
  cover: "object-cover",
  fill: "object-fill",
  contain: "object-contain",
};

export function ProductMockupPreview({
  productName,
  baseImageSrc,
  artworkUrls,
  printArea = DEFAULT_PRINT_AREA,
  roundedPrintArea = false,
  borderRadius = "8%",
  disclaimer = "Rough draft only — final placement, colour, and sizing may vary slightly.",
  className,
  emptyHint = "Your design will appear on the product here",
  interactive = false,
  artworkTransform = DEFAULT_ARTWORK_TRANSFORM,
  onArtworkTransformChange,
}: ProductMockupPreviewProps) {
  const visibleUrls = artworkUrls.filter(Boolean);
  const isSingleImage = visibleUrls.length === 1;
  const canAdjust = interactive && isSingleImage && Boolean(onArtworkTransformChange);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const { cols, rows } = getCollageGridLayout(visibleUrls.length);
  const slots = Math.max(cols * rows, 1);
  const collageUrls = visibleUrls.slice(0, slots);

  const updateTransform = useCallback(
    (patch: Partial<ArtworkTransform>) => {
      onArtworkTransformChange?.({ ...artworkTransform, ...patch });
    },
    [artworkTransform, onArtworkTransformChange]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!canAdjust) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: artworkTransform.offsetX,
      baseY: artworkTransform.offsetY,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!canAdjust || !dragRef.current) return;
    const dx = ((event.clientX - dragRef.current.startX) / 140) * 100;
    const dy = ((event.clientY - dragRef.current.startY) / 140) * 100;
    updateTransform({
      offsetX: Math.round(Math.max(-80, Math.min(80, dragRef.current.baseX + dx))),
      offsetY: Math.round(Math.max(-80, Math.min(80, dragRef.current.baseY + dy))),
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!canAdjust) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">Product preview</p>
      {productName && (
        <p className="mt-2 font-display text-lg font-semibold text-pure-paper">{productName}</p>
      )}

      <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#0a0c14]/80 p-4 shadow-[0_0_40px_rgba(6,94,229,0.15)]">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-[#12141c] to-[#0a0c14]">
          <Image
            src={baseImageSrc}
            alt={productName ? `${productName} mockup` : "Product mockup"}
            fill
            className="object-contain p-4"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          <div
            className={cn(
              "absolute overflow-hidden border-2 border-cyan/50 bg-white shadow-[inset_0_0_12px_rgba(0,0,0,0.08)]",
              roundedPrintArea ? "border-cyan/40" : "rounded-sm"
            )}
            style={{
              left: `${printArea.x}%`,
              top: `${printArea.y}%`,
              width: `${printArea.width}%`,
              height: `${printArea.height}%`,
              borderRadius: roundedPrintArea ? borderRadius : undefined,
            }}
          >
            {collageUrls.length > 0 ? (
              isSingleImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={collageUrls[0]}
                  alt="Your artwork on product"
                  draggable={false}
                  className={cn(
                    "absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full bg-white",
                    FIT_CLASS[artworkTransform.fit],
                    canAdjust && "cursor-grab touch-none active:cursor-grabbing"
                  )}
                  style={{
                    transform: `translate(calc(-50% + ${artworkTransform.offsetX}%), calc(-50% + ${artworkTransform.offsetY}%)) ${artworkTransformToCss(
                      artworkTransform
                    )}`,
                    transformOrigin: "center center",
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                />
              ) : (
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
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center p-2 text-center text-[10px] leading-snug text-chrome-mid sm:text-xs">
                {emptyHint}
              </div>
            )}
          </div>
        </div>
      </div>

      {canAdjust && (
        <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-pure-paper">Adjust your design on the product</p>
          <p className="text-xs text-chrome-mid">
            Drag to move. Use stretch sliders to cover the full print area. The cyan box shows where your design prints.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onArtworkTransformChange?.(FILL_PRINT_AREA_TRANSFORM)}
              className="rounded-sm bg-cyan/20 px-3 py-1.5 text-xs font-semibold text-cyan hover:bg-cyan/30"
            >
              Fill print area
            </button>
            <button
              type="button"
              onClick={() =>
                updateTransform({ fit: "fill", scale: 100, scaleX: 100, scaleY: 100, offsetX: 0, offsetY: 0 })
              }
              className="rounded-sm border border-white/15 px-3 py-1.5 text-xs text-pure-paper hover:border-cyan/40"
            >
              Stretch to fit
            </button>
            <button
              type="button"
              onClick={() => onArtworkTransformChange?.(DEFAULT_ARTWORK_TRANSFORM)}
              className="text-xs text-chrome-mid hover:text-cyan"
            >
              Reset
            </button>
          </div>

          <label className="block text-xs text-chrome-light">
            Overall zoom ({artworkTransform.scale}%)
            <input
              type="range"
              min={50}
              max={300}
              step={5}
              value={artworkTransform.scale}
              onChange={(e) => updateTransform({ scale: Number(e.target.value) })}
              className="mt-2 w-full accent-cyan"
            />
          </label>

          <label className="block text-xs text-chrome-light">
            Stretch width ({artworkTransform.scaleX}%)
            <input
              type="range"
              min={50}
              max={200}
              step={5}
              value={artworkTransform.scaleX}
              onChange={(e) => updateTransform({ scaleX: Number(e.target.value) })}
              className="mt-2 w-full accent-cyan"
            />
          </label>

          <label className="block text-xs text-chrome-light">
            Stretch height ({artworkTransform.scaleY}%)
            <input
              type="range"
              min={50}
              max={200}
              step={5}
              value={artworkTransform.scaleY}
              onChange={(e) => updateTransform({ scaleY: Number(e.target.value) })}
              className="mt-2 w-full accent-cyan"
            />
          </label>
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-chrome-mid">{disclaimer}</p>
      {visibleUrls.length > 1 && (
        <p className="mt-1 text-xs text-cyan">
          Showing {visibleUrls.length} image{visibleUrls.length === 1 ? "" : "s"} as a collage rough draft.
        </p>
      )}
    </div>
  );
}
