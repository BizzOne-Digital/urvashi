"use client";

import Link from "next/link";
import Image from "next/image";
import { getProductDisplayImages } from "@/lib/product-catalog";
import { resolveImageSrc } from "@/lib/image-url";
import { getProductPriceDisplay } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface ProductCardProduct {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  images?: Array<{ url: string; alt?: string }>;
  blankImage?: { url: string; alt?: string };
  customizedImage?: { url: string; alt?: string };
  cardImage?: { url: string; alt?: string };
  pricingMode?: "fixed" | "quote";
  availability?: string;
  price?: number;
  currency?: string;
  featured?: boolean;
  onSale?: boolean;
  categorySlug?: string;
}

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const { blank, customized } = getProductDisplayImages(product);
  const { display, isQuote } = getProductPriceDisplay(product, product.currency || "CAD");

  return (
    <article className={cn("card-product group flex h-full flex-col", className)} data-reveal-item>
      <Link href={`/shop/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-chrome-light/30 via-pure-paper to-chrome-light/20">
          {product.cardImage ? (
            <Image
              src={resolveImageSrc(product.cardImage.url)}
              alt={product.cardImage.alt || `${product.name} blank and customized`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
              priority={priority}
            />
          ) : blank && customized ? (
            <div className="grid h-full w-full grid-cols-2">
              <div className="relative border-r border-chrome-light/40 bg-pure-paper">
                <Image
                  src={resolveImageSrc(blank.url)}
                  alt={blank.alt || `${product.name} blank`}
                  fill
                  className="object-contain p-3"
                  sizes="25vw"
                  priority={priority}
                />
                <span className="absolute bottom-2 left-2 rounded bg-ink-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pure-paper">
                  Blank
                </span>
              </div>
              <div className="relative bg-gradient-to-br from-royal-blue/5 to-cyan/10">
                <Image
                  src={resolveImageSrc(customized.url)}
                  alt={customized.alt || `${product.name} customized`}
                  fill
                  className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                  sizes="25vw"
                  priority={priority}
                />
                <span className="absolute bottom-2 left-2 rounded bg-royal-blue px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pure-paper">
                  Custom
                </span>
              </div>
            </div>
          ) : blank ? (
            <Image
              src={resolveImageSrc(blank.url)}
              alt={blank.alt || product.name}
              fill
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-chrome-mid">No image</div>
          )}

          {product.featured && (
            <span className="absolute left-3 top-3 rounded-sm bg-gradient-to-r from-royal-blue to-cyan px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-pure-paper shadow-lg">
              Featured
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          {product.categorySlug && (
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan">
              {product.categorySlug.replace(/-/g, " ")}
            </p>
          )}
          <h3 className="mt-1 font-display text-lg font-semibold text-ink-black transition-colors group-hover:text-royal-blue">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="mt-1 line-clamp-2 text-sm text-carbon">{product.shortDescription}</p>
          )}
          <p className={cn("mt-auto pt-3 text-lg font-bold", isQuote ? "text-deep-magenta" : "text-royal-blue")}>
            {display}
            {!isQuote && <span className="ml-2 text-xs font-normal text-chrome-mid">blank from</span>}
          </p>
        </div>
      </Link>
    </article>
  );
}
