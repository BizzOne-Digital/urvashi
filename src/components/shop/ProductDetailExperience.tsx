"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { getProductDisplayImages, DESIGN_HELP_SURCHARGE } from "@/lib/product-catalog";
import { resolveImageSrc } from "@/lib/image-url";
import { getProductPriceDisplay } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ProductMode = "blank" | "customized";

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
  const allowsBlank = product.allowsBlankPurchase !== false;
  const allowsCustom = product.allowsCustomization !== false && product.customizer?.enabled !== false;
  const [mode, setMode] = useState<ProductMode>(allowsCustom ? "customized" : "blank");

  const { blank, customized } = getProductDisplayImages(product);
  const activeImage = mode === "blank" ? blank : customized;
  const { display } = getProductPriceDisplay(product, product.currency);
  const designFee = product.designHelpSurcharge ?? DESIGN_HELP_SURCHARGE;
  const customBase = product.price ?? 0;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#0a0c14]">
        {activeImage ? (
          <Image
            src={resolveImageSrc(activeImage.url)}
            alt={activeImage.alt || product.name}
            fill
            className="object-contain p-8"
            sizes="50vw"
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

        {(allowsBlank || allowsCustom) && (
          <div className="flex rounded-sm border border-white/15 bg-white/[0.04] p-1">
            {allowsBlank && (
              <button
                type="button"
                onClick={() => setMode("blank")}
                className={cn(
                  "flex-1 rounded-sm px-4 py-2.5 text-sm font-semibold transition-all",
                  mode === "blank"
                    ? "bg-gradient-to-r from-cyan to-royal-blue text-pure-paper shadow"
                    : "text-chrome-light hover:bg-white/5 hover:text-pure-paper"
                )}
              >
                Blank
              </button>
            )}
            {allowsCustom && (
              <button
                type="button"
                onClick={() => setMode("customized")}
                className={cn(
                  "flex-1 rounded-sm px-4 py-2.5 text-sm font-semibold transition-all",
                  mode === "customized"
                    ? "bg-gradient-to-r from-cyan to-royal-blue text-pure-paper shadow"
                    : "text-chrome-light hover:bg-white/5 hover:text-pure-paper"
                )}
              >
                Customized
              </button>
            )}
          </div>
        )}

        <p className="text-2xl font-bold text-cyan">{display}</p>

        {product.shortDescription && (
          <p className="leading-relaxed !text-white">{product.shortDescription}</p>
        )}

        {mode === "blank" && allowsBlank && (
          <div className="space-y-4 border-t border-white/10 pt-5">
            <p className="text-sm !text-white">
              Preview the blank version of this product.
              {allowsCustom && (
                <>
                  {" "}
                  Switch to{" "}
                  <button
                    type="button"
                    onClick={() => setMode("customized")}
                    className="font-semibold text-cyan hover:underline"
                  >
                    Customized
                  </button>{" "}
                  to order with your design.
                </>
              )}
            </p>
          </div>
        )}

        {mode === "customized" && allowsCustom && (
          <div className="space-y-4 border-t border-white/10 pt-5">
            <p className="text-sm !text-white">
              Upload your artwork and we will customize this product for you. Starting at{" "}
              <span className="font-semibold !text-white">
                {formatCurrency(customBase, product.currency)}
              </span>{" "}
              with your own design.
            </p>
            <p className="text-sm text-muted">
              Optional design help from our team: +{formatCurrency(designFee, product.currency)} (we send 3–4 design
              options).
            </p>
            <Link href={`/shop/${product.slug}/customize`} className={buttonVariants("primary")}>
              Customize it your way
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
