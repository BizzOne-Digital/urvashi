"use client";

import Link from "next/link";
import Image from "next/image";
import { getProductDisplayImages } from "@/lib/product-catalog";
import { resolveImageSrc } from "@/lib/image-url";
import { getProductPriceDisplay } from "@/lib/pricing";
import { isNewProduct, isPromoProduct } from "@/lib/promo";
import { UploadArtworkPlaceholder } from "@/components/shop/UploadArtworkPlaceholder";
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
  createdAt?: string;
  categorySlug?: string;
}

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
  priority?: boolean;
}

function ProductCardImage({
  product,
  blank,
  customized,
  priority,
}: {
  product: ProductCardProduct;
  blank?: { url: string; alt?: string };
  customized?: { url: string; alt?: string };
  priority?: boolean;
}) {
  const sampleImage = customized || product.cardImage || blank;

  if (sampleImage) {
    return (
      <div className="grid h-full w-full grid-cols-2">
        <UploadArtworkPlaceholder className="border-r border-chrome-light/40" />
        <div className="relative bg-gradient-to-br from-royal-blue/5 to-cyan/10">
          <Image
            src={resolveImageSrc(sampleImage.url)}
            alt={sampleImage.alt || `${product.name} sample design`}
            fill
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            sizes="25vw"
            priority={priority}
          />
          <span className="absolute bottom-2 left-2 rounded bg-royal-blue px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pure-paper">
            Sample
          </span>
        </div>
      </div>
    );
  }

  return (
    <UploadArtworkPlaceholder className="h-full min-h-[200px]" />
  );
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const { blank, customized } = getProductDisplayImages(product);
  const { display, isQuote } = getProductPriceDisplay(product, product.currency || "CAD");
  const isNew = isNewProduct(product.createdAt);
  const isPromo = isPromoProduct(product) && !isNew;

  return (
    <article className={cn("card-product group flex h-full flex-col", className)} data-reveal-item>
      <Link href={`/shop/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-chrome-light/30 via-pure-paper to-chrome-light/20">
          <ProductCardImage
            product={product}
            blank={blank}
            customized={customized}
            priority={priority}
          />

          {isNew && (
            <span className="absolute left-3 top-3 rounded-sm bg-cyan px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-pure-paper shadow-lg">
              New
            </span>
          )}
          {isPromo && (
            <span className="absolute left-3 top-3 rounded-sm bg-gradient-to-r from-magenta to-royal-blue px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-pure-paper shadow-lg">
              Promo
            </span>
          )}
          {product.featured && !isNew && !isPromo && (
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
          <h3 className="mt-1 font-display text-lg font-semibold text-pure-paper transition-colors group-hover:text-cyan">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="mt-1 line-clamp-2 text-sm text-chrome-light">{product.shortDescription}</p>
          )}
          <p className={cn("mt-auto pt-3 text-lg font-bold", isQuote ? "text-magenta" : "text-cyan")}>
            {display}
            {!isQuote && <span className="ml-2 text-xs font-normal text-chrome-mid">blank from</span>}
          </p>
        </div>
      </Link>
    </article>
  );
}
