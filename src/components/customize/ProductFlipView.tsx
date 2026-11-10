"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { getCollageGridLayout, type PrintAreaRect } from "@/lib/mockup-preview";
import { artworkTransformToBox, type ArtworkTransform } from "@/lib/artwork-transform";
import { getBackPrintArea } from "@/lib/product-mockup-config";
import type { Product360ViewProps } from "@/lib/product-360";
import { cn } from "@/lib/utils";

interface FaceProps {
  baseImageSrc: string;
  alt: string;
  artworkUrls: string[];
  printArea: PrintAreaRect;
  transform: ArtworkTransform;
  rounded?: boolean;
  borderRadius?: string;
  blend?: "multiply" | "normal";
}

function MockupFace({
  baseImageSrc,
  alt,
  artworkUrls,
  printArea,
  transform,
  rounded,
  borderRadius,
  blend,
}: FaceProps) {
  const urls = artworkUrls.filter(Boolean);
  const box = artworkTransformToBox(transform);
  const { cols, rows } = getCollageGridLayout(urls.length);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#f4f4f5]">
      <Image src={baseImageSrc} alt={alt} fill className="object-contain p-3" sizes="(max-width: 1024px) 100vw, 50vw" />
      {urls.length > 0 && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${printArea.x}%`,
            top: `${printArea.y}%`,
            width: `${printArea.width}%`,
            height: `${printArea.height}%`,
            borderRadius: rounded ? borderRadius : undefined,
          }}
        >
          {urls.length === 1 ? (
            <div
              className="absolute"
              style={{
                left: `${box.cx}%`,
                top: `${box.cy}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urls[0]}
                alt="Your artwork"
                draggable={false}
                className="h-full w-full object-cover"
                style={blend === "multiply" ? { mixBlendMode: "multiply", opacity: 0.92 } : undefined}
              />
            </div>
          ) : (
            <div
              className="grid h-full w-full gap-px"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              }}
            >
              {urls.slice(0, cols * rows).map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${url}-${i}`} src={url} alt="" className="h-full w-full object-cover" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Flat products (shirts, totes, caps...) can't truly spin, so the estimate is a card you can
 * turn over: drag to flip between front and back, it snaps to the nearest side on release.
 */
export function ProductFlipView({
  productName,
  frontBaseImage,
  backBaseImage,
  frontArtworkUrls,
  backArtworkUrls,
  mockupConfig,
  frontTransform,
  backTransform,
  wrap,
  disclaimer,
}: Product360ViewProps) {
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startAngle: number } | null>(null);

  const backPrintArea = getBackPrintArea(mockupConfig);
  const normalized = ((angle % 360) + 360) % 360;
  const showingBack = normalized > 90 && normalized < 270;
  const backUrls = wrap && !backArtworkUrls.length ? frontArtworkUrls : backArtworkUrls;
  // Light sweeps across the card as it turns, which sells the 3D effect.
  const glare = Math.abs(Math.sin((angle * Math.PI) / 180));

  const snapTo = (target: number) => {
    setDragging(false);
    setAngle(target);
  };
  const snapNearest = (value: number) => Math.round(value / 180) * 180;

  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">360° view</p>
      <p className="mt-2 text-sm text-chrome-light">
        Drag the product left or right to turn it over and check the front and back.
      </p>

      <div
        className="mx-auto mt-4 max-w-md select-none"
        style={{ perspective: "1400px", touchAction: "pan-y" }}
        onPointerDown={(e) => {
          drag.current = { startX: e.clientX, startAngle: angle };
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setAngle(drag.current.startAngle + (e.clientX - drag.current.startX) * 0.6);
        }}
        onPointerUp={() => {
          if (!drag.current) return;
          drag.current = null;
          snapTo(snapNearest(angle));
        }}
        onPointerCancel={() => {
          drag.current = null;
          snapTo(snapNearest(angle));
        }}
      >
        <div
          className={cn(
            "relative aspect-square w-full cursor-grab active:cursor-grabbing",
            !dragging && "transition-transform duration-500 ease-out"
          )}
          style={{ transformStyle: "preserve-3d", transform: `rotateY(${angle}deg)` }}
        >
          <div
            className="absolute inset-0 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <MockupFace
              baseImageSrc={frontBaseImage}
              alt={`${productName} front`}
              artworkUrls={frontArtworkUrls}
              printArea={mockupConfig.printArea}
              transform={frontTransform}
              rounded={mockupConfig.rounded}
              borderRadius={mockupConfig.borderRadius}
              blend={mockupConfig.estimateArtworkBlend}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-black/30 via-transparent to-white/30"
              style={{ opacity: glare }}
            />
          </div>
          <div
            className="absolute inset-0 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <MockupFace
              baseImageSrc={backBaseImage}
              alt={`${productName} back`}
              artworkUrls={backUrls}
              printArea={backPrintArea}
              transform={wrap ? frontTransform : backTransform}
              rounded={mockupConfig.rounded}
              borderRadius={mockupConfig.borderRadius}
              blend={mockupConfig.estimateArtworkBlend}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-l from-black/30 via-transparent to-white/30"
              style={{ opacity: glare }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => snapTo(Math.round(angle / 360) * 360)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            !showingBack ? "bg-cyan text-pure-paper" : "border border-white/15 text-chrome-light hover:text-pure-paper"
          )}
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => snapTo(Math.round((angle - 180) / 360) * 360 + 180)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            showingBack ? "bg-cyan text-pure-paper" : "border border-white/15 text-chrome-light hover:text-pure-paper"
          )}
        >
          Back
        </button>
      </div>

      {disclaimer && <p className="mt-3 text-xs leading-relaxed text-chrome-mid">{disclaimer}</p>}
    </div>
  );
}
