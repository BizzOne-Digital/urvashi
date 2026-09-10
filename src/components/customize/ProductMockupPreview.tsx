"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import { DEFAULT_PRINT_AREA, getCollageGridLayout, type PrintAreaRect } from "@/lib/mockup-preview";
import {
  artworkBoxToTransform,
  artworkTransformToBox,
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

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const FIT_CLASS: Record<ArtworkTransform["fit"], string> = {
  cover: "object-cover",
  fill: "object-fill",
  contain: "object-contain",
};

const HANDLE_POSITIONS: Record<
  ResizeHandle,
  { className: string; cursor: string }
> = {
  nw: { className: "-left-1.5 -top-1.5", cursor: "cursor-nwse-resize" },
  n: { className: "left-1/2 -top-1.5 -translate-x-1/2", cursor: "cursor-ns-resize" },
  ne: { className: "-right-1.5 -top-1.5", cursor: "cursor-nesw-resize" },
  e: { className: "-right-1.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
  se: { className: "-right-1.5 -bottom-1.5", cursor: "cursor-nwse-resize" },
  s: { className: "left-1/2 -bottom-1.5 -translate-x-1/2", cursor: "cursor-ns-resize" },
  sw: { className: "-left-1.5 -bottom-1.5", cursor: "cursor-nesw-resize" },
  w: { className: "-left-1.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
};

function resizeBoxFromHandle(
  handle: ResizeHandle,
  base: { cx: number; cy: number; w: number; h: number },
  dxPct: number,
  dyPct: number
) {
  const halfW = base.w / 2;
  const halfH = base.h / 2;
  const left = base.cx - halfW;
  const right = base.cx + halfW;
  const top = base.cy - halfH;
  const bottom = base.cy + halfH;

  let nextLeft = left;
  let nextRight = right;
  let nextTop = top;
  let nextBottom = bottom;

  if (handle.includes("w")) nextLeft += dxPct;
  if (handle.includes("e")) nextRight += dxPct;
  if (handle.includes("n")) nextTop += dyPct;
  if (handle.includes("s")) nextBottom += dyPct;

  const w = Math.max(15, nextRight - nextLeft);
  const h = Math.max(15, nextBottom - nextTop);

  return {
    cx: (nextLeft + nextRight) / 2,
    cy: (nextTop + nextBottom) / 2,
    w,
    h,
  };
}

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
  const printAreaRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<
    | {
        mode: "move" | "resize";
        handle?: ResizeHandle;
        startX: number;
        startY: number;
        baseBox: { cx: number; cy: number; w: number; h: number };
        baseTransform: ArtworkTransform;
      }
    | null
  >(null);

  const { cols, rows } = getCollageGridLayout(visibleUrls.length);
  const slots = Math.max(cols * rows, 1);
  const collageUrls = visibleUrls.slice(0, slots);
  const artworkBox = artworkTransformToBox(artworkTransform);

  const updateTransform = useCallback(
    (patch: Partial<ArtworkTransform>) => {
      onArtworkTransformChange?.({ ...artworkTransform, ...patch });
    },
    [artworkTransform, onArtworkTransformChange]
  );

  const applyBox = useCallback(
    (box: { cx: number; cy: number; w: number; h: number }, fit: ArtworkTransform["fit"] = "fill") => {
      onArtworkTransformChange?.(
        artworkBoxToTransform(box.cx, box.cy, box.w, box.h, artworkTransform.scale, fit)
      );
    },
    [artworkTransform.scale, onArtworkTransformChange]
  );

  const getDeltaPercent = (clientX: number, clientY: number) => {
    const rect = printAreaRef.current?.getBoundingClientRect();
    if (!rect) return { dxPct: 0, dyPct: 0 };
    return {
      dxPct: ((clientX - interactionRef.current!.startX) / rect.width) * 100,
      dyPct: ((clientY - interactionRef.current!.startY) / rect.height) * 100,
    };
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLElement>,
    mode: "move" | "resize",
    handle?: ResizeHandle
  ) => {
    if (!canAdjust) return;
    event.preventDefault();
    event.stopPropagation();
    const boxEl = (event.currentTarget as HTMLElement).closest("[data-artwork-box]") as HTMLElement | null;
    boxEl?.setPointerCapture(event.pointerId);
    interactionRef.current = {
      mode,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      baseBox: artworkTransformToBox(artworkTransform),
      baseTransform: artworkTransform,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!canAdjust || !interactionRef.current) return;

    const { dxPct, dyPct } = getDeltaPercent(event.clientX, event.clientY);
    const { mode, handle, baseBox, baseTransform } = interactionRef.current;

    if (mode === "move") {
      applyBox(
        {
          cx: baseBox.cx + dxPct,
          cy: baseBox.cy + dyPct,
          w: baseBox.w,
          h: baseBox.h,
        },
        baseTransform.fit
      );
      return;
    }

    if (handle) {
      applyBox(resizeBoxFromHandle(handle, baseBox, dxPct, dyPct), "fill");
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (!canAdjust) return;
    interactionRef.current = null;
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
              "absolute border border-dashed border-cyan/25",
              roundedPrintArea ? "rounded-md" : "rounded-sm"
            )}
            style={{
              left: `${printArea.x}%`,
              top: `${printArea.y}%`,
              width: `${printArea.width}%`,
              height: `${printArea.height}%`,
              borderRadius: roundedPrintArea ? borderRadius : undefined,
            }}
          />

          <div
            ref={printAreaRef}
            className={cn("absolute overflow-visible", roundedPrintArea ? "rounded-md" : "rounded-sm")}
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
                <div
                  data-artwork-box
                  className="absolute touch-none"
                  style={{
                    left: `${artworkBox.cx}%`,
                    top: `${artworkBox.cy}%`,
                    width: `${artworkBox.w}%`,
                    height: `${artworkBox.h}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={collageUrls[0]}
                    alt="Your artwork on product"
                    draggable={false}
                    className={cn(
                      "h-full w-full bg-white",
                      FIT_CLASS[artworkTransform.fit],
                      canAdjust && "cursor-grab active:cursor-grabbing"
                    )}
                    onPointerDown={(event) => handlePointerDown(event, "move")}
                  />

                  {canAdjust && (
                    <>
                      <div className="pointer-events-none absolute inset-0 border-2 border-cyan shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
                      {(Object.keys(HANDLE_POSITIONS) as ResizeHandle[]).map((handle) => (
                        <button
                          key={handle}
                          type="button"
                          aria-label={`Resize ${handle}`}
                          className={cn(
                            "absolute z-10 h-3.5 w-3.5 rounded-sm border-2 border-cyan bg-white shadow-sm touch-none",
                            HANDLE_POSITIONS[handle].className,
                            HANDLE_POSITIONS[handle].cursor
                          )}
                          onPointerDown={(event) => handlePointerDown(event, "resize", handle)}
                        />
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div
                  className="grid h-full w-full gap-px overflow-hidden bg-white/20 p-px"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                    borderRadius: roundedPrintArea ? borderRadius : undefined,
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
            Drag the image to move it. Drag the corner or edge handles to stretch it like resizing a window.
            The dashed outline shows the print area.
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
