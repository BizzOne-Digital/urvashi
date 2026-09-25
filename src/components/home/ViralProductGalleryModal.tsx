"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomeViralMediaItem } from "@/lib/home-viral";
import { isYoutubeUrl, youtubeEmbedUrl } from "@/lib/home-viral-gallery";
import { resolveImageSrc } from "@/lib/image-url";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ViralGalleryProduct {
  name: string;
  slug: string;
  gallery: HomeViralMediaItem[];
}

interface ViralProductGalleryModalProps {
  product: ViralGalleryProduct | null;
  onClose: () => void;
}

export function ViralProductGalleryModal({ product, onClose }: ViralProductGalleryModalProps) {
  const [index, setIndex] = useState(0);

  const slides = useMemo(() => {
    if (!product) return [];
    return product.gallery;
  }, [product]);

  const totalSlides = slides.length + 1;
  const onCtaSlide = product && index === slides.length;

  useEffect(() => {
    setIndex(0);
  }, [product?.slug]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, totalSlides - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose, totalSlides]);

  const goPrev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const goNext = useCallback(
    () => setIndex((i) => Math.min(i + 1, totalSlides - 1)),
    [totalSlides]
  );

  if (!product) return null;

  const customizeHref = `/shop/${product.slug}/customize`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} gallery`}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d111c] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-magenta">Viral pick</p>
            <h2 className="truncate font-display text-lg font-semibold text-pure-paper">{product.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-chrome-light hover:bg-white/10 hover:text-pure-paper"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="relative flex min-h-[50vh] flex-1 flex-col">
          {onCtaSlide ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
              <p className="max-w-md text-chrome-light">
                Ready to make it yours? Upload your artwork and preview your design before checkout.
              </p>
              <Link href={customizeHref} className={cn(buttonVariants("primary"), "px-8 py-3 text-base")}>
                Customize this product
              </Link>
              <Link href={`/shop/${product.slug}`} className="text-sm text-cyan hover:underline">
                View product details
              </Link>
            </div>
          ) : (
            <div className="relative flex flex-1 items-center justify-center bg-black/40 p-4">
              {slides[index] && <GallerySlide item={slides[index]} productName={product.name} />}
            </div>
          )}

          {totalSlides > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                disabled={index === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-pure-paper disabled:opacity-30"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={index >= totalSlides - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-pure-paper disabled:opacity-30"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  index === i ? "bg-cyan" : "bg-white/30"
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
            <button
              type="button"
              onClick={() => setIndex(slides.length)}
              className={cn(
                "h-2 w-6 rounded-full text-[8px] font-bold uppercase",
                onCtaSlide ? "bg-magenta text-pure-paper" : "bg-white/20 text-chrome-mid"
              )}
              aria-label="Customize"
            >
              CTA
            </button>
          </div>
          {!onCtaSlide && index === slides.length - 1 && slides.length > 0 && (
            <button type="button" onClick={goNext} className="text-sm font-semibold text-cyan hover:underline">
              Next: Customize →
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function GallerySlide({ item, productName }: { item: HomeViralMediaItem; productName: string }) {
  const alt = item.alt || productName;

  if (item.type === "video" || isYoutubeUrl(item.url)) {
    const embed = isYoutubeUrl(item.url) ? youtubeEmbedUrl(item.url) : null;
    if (embed) {
      return (
        <iframe
          title={alt}
          src={embed}
          className="aspect-video w-full max-h-[60vh] rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <video
        key={item.url}
        src={resolveImageSrc(item.url)}
        controls
        playsInline
        className="max-h-[60vh] max-w-full rounded-lg"
      />
    );
  }

  return (
    <div className="relative h-[min(60vh,520px)] w-full">
      <Image
        src={resolveImageSrc(item.url)}
        alt={alt}
        fill
        className="object-contain"
        sizes="(max-width: 896px) 100vw, 896px"
        unoptimized={item.url.startsWith("/api/uploads/")}
      />
    </div>
  );
}
