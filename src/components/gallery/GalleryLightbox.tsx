"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  category?: string;
}

interface GalleryLightboxProps {
  items: GalleryItem[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function GalleryLightbox({ items, initialIndex = 0, open, onClose }: GalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose, goPrev, goNext]);

  if (!open || items.length === 0) return null;

  const current = items[index];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-black/95 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-sm bg-pure-paper/10 px-3 py-2 text-sm font-medium text-pure-paper hover:bg-pure-paper/20"
      >
        Close
      </button>

      <button
        type="button"
        onClick={goPrev}
        className="absolute left-4 z-10 hidden rounded-sm bg-pure-paper/10 px-3 py-4 text-pure-paper hover:bg-pure-paper/20 sm:block"
        aria-label="Previous image"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={goNext}
        className="absolute right-4 z-10 hidden rounded-sm bg-pure-paper/10 px-3 py-4 text-pure-paper hover:bg-pure-paper/20 sm:block sm:right-16"
        aria-label="Next image"
      >
        ›
      </button>

      <div className="relative flex max-h-[85vh] w-full max-w-5xl flex-col items-center">
        <div className="relative aspect-[4/3] w-full max-h-[70vh]">
          <Image
            src={current.url}
            alt={current.alt || "Gallery image"}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
        <div className="mt-4 w-full text-center text-pure-paper">
          {current.caption && <p className="text-sm text-chrome-light">{current.caption}</p>}
          <p className="mt-1 text-xs text-chrome-mid">
            {index + 1} / {items.length}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 sm:hidden">
        <button type="button" onClick={goPrev} className={cn("btn-secondary", "border-pure-paper text-pure-paper")}>
          Prev
        </button>
        <button type="button" onClick={goNext} className={cn("btn-secondary", "border-pure-paper text-pure-paper")}>
          Next
        </button>
      </div>
    </div>
  );
}
