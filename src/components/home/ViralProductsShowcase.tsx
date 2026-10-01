"use client";

import { useState } from "react";
import Image from "next/image";
import type { HomeViralMediaItem } from "@/lib/home-viral";
import { getProductDisplayImages } from "@/lib/product-catalog";
import { resolveImageSrc } from "@/lib/image-url";
import { getProductPriceDisplay } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import {
  ViralProductGalleryModal,
  type ViralGalleryProduct,
} from "@/components/home/ViralProductGalleryModal";

export interface ViralShowcaseProduct {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  categorySlug?: string;
  pricingMode?: "fixed" | "quote";
  price?: number;
  currency?: string;
  printLocations?: Array<{ id: string; label: string; surcharge?: number }>;
  blankImage?: { url: string; alt?: string };
  customizedImage?: { url: string; alt?: string };
  cardImage?: { url: string; alt?: string };
  images?: Array<{ url: string; alt?: string }>;
  gallery: HomeViralMediaItem[];
}

interface ViralProductsShowcaseProps {
  products: ViralShowcaseProduct[];
  className?: string;
}

export function ViralProductsShowcase({ products, className }: ViralProductsShowcaseProps) {
  const [active, setActive] = useState<ViralGalleryProduct | null>(null);

  return (
    <>
      <div
        className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
        data-reveal-stagger
      >
        {products.map((product, index) => {
          const { blank, customized } = getProductDisplayImages(product);
          const sample = customized || product.cardImage || blank;
          const { display, isQuote } = getProductPriceDisplay(product, product.currency || "CAD");
          const mediaCount = product.gallery.length;

          return (
            <article key={product._id} className="card-product group flex h-full flex-col" data-reveal-item>
              <button
                type="button"
                onClick={() =>
                  setActive({
                    name: product.name,
                    slug: product.slug,
                    gallery: product.gallery,
                  })
                }
                className="flex flex-1 flex-col text-left"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-chrome-light/30 via-pure-paper to-chrome-light/20">
                  {sample?.url && (
                    <Image
                      src={resolveImageSrc(sample.url)}
                      alt={sample.alt || `${product.name} sample`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 33vw"
                      priority={index < 3}
                    />
                  )}
                  <span className="absolute bottom-2 left-2 rounded bg-royal-blue/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pure-paper">
                    Sample
                  </span>
                  {mediaCount > 1 && (
                    <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-pure-paper">
                      {mediaCount} photos & videos
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  {product.categorySlug && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan">
                      {product.categorySlug.replace(/-/g, " ")}
                    </p>
                  )}
                  <h3 className="mt-1 font-display text-lg font-semibold text-pure-paper transition-colors group-hover:text-cyan">
                    {product.name}
                  </h3>
                  {product.shortDescription && (
                    <p className="mt-1 line-clamp-2 text-sm text-chrome-light">{product.shortDescription}</p>
                  )}
                  <p className="mt-auto pt-3 text-sm text-cyan">Tap to view gallery →</p>
                  <p className={cn("text-lg font-bold", isQuote ? "text-magenta" : "text-cyan")}>
                    {display}
                    {!isQuote && (
                      <span className="ml-2 text-xs font-normal text-chrome-mid">blank from</span>
                    )}
                  </p>
                </div>
              </button>
            </article>
          );
        })}
      </div>

      <ViralProductGalleryModal product={active} onClose={() => setActive(null)} />
    </>
  );
}
