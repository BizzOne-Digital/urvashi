"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { getProductDisplayImages, DESIGN_HELP_SURCHARGE } from "@/lib/product-catalog";
import { resolveImageSrc } from "@/lib/image-url";
import { getProductPriceDisplay } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

interface ProductDetailExperienceProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    sku: string;
    categorySlug?: string;
    shortDescription?: string;
    pricingMode: "fixed" | "quote";
    price?: number;
    printLocations?: Array<{ id: string; label: string; surcharge?: number }>;
    currency?: string;
    minQuantity: number;
    quantityStep: number;
    images?: Array<{ url: string; alt?: string }>;
    blankImage?: { url: string; alt?: string };
    customizedImage?: { url: string; alt?: string };
    allowsBlankPurchase?: boolean;
    allowsCustomization?: boolean;
    designHelpSurcharge?: number;
    customizer?: { enabled?: boolean; previewDisclaimer?: string };
  };
}

export function ProductDetailExperience({ product }: ProductDetailExperienceProps) {
  const allowsCustom = product.allowsCustomization !== false && product.customizer?.enabled !== false;

  const { blank, customized } = getProductDisplayImages(product);
  const heroImage = customized || blank || product.images?.[0];
  const { display } = getProductPriceDisplay(product, product.currency);
  const designFee = product.designHelpSurcharge ?? DESIGN_HELP_SURCHARGE;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#0a0c14]">
        {heroImage ? (
          <Image
            src={resolveImageSrc(heroImage.url)}
            alt={heroImage.alt || product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-chrome-mid">No image</div>
        )}
      </div>

      <div className="product-detail-panel space-y-5">
        {product.categorySlug && (
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan">
            {product.categorySlug.replace(/-/g, " ")}
          </p>
        )}
        <h1 className="heading-section text-pure-paper">{product.name}</h1>

        <p className="text-2xl font-bold text-cyan">{display}</p>

        {product.shortDescription && (
          <p className="leading-relaxed !text-white">{product.shortDescription}</p>
        )}

        {allowsCustom && (
          <div className="space-y-4 border-t border-white/10 pt-5">
            <p className="text-sm !text-white">
              Upload your artwork and we will print this product for you. Pricing shown above
              applies to your print option at checkout.
            </p>
            <p className="text-sm text-muted">
              Optional design help from our team: +{formatCurrency(designFee, product.currency)} (we send 3–4 design
              options).
            </p>
            <Link href={`/shop/${product.slug}/customize`} className={buttonVariants("primary")}>
              Customize & order
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
