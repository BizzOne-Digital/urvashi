"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/Button";
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
  const [mode, setMode] = useState<ProductMode>(allowsBlank ? "blank" : "customized");
  const [quantity, setQuantity] = useState(product.minQuantity || 1);
  const [adding, setAdding] = useState(false);

  const { blank, customized } = getProductDisplayImages(product);
  const activeImage = mode === "blank" ? blank : customized;
  const { display, isQuote } = getProductPriceDisplay(product, product.currency);
  const designFee = product.designHelpSurcharge ?? DESIGN_HELP_SURCHARGE;
  const customBase = product.price ?? 0;

  const handleAddBlank = async () => {
    if (isQuote) {
      window.location.href = "/contact";
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          item: {
            productId: product._id,
            productSlug: product.slug,
            productName: `${product.name} (Blank)`,
            sku: product.sku,
            quantity,
            pricingMode: product.pricingMode,
            customization: { configSnapshot: { purchaseMode: "blank" } },
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add to cart");
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Blank item added to cart");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const fieldClass =
    "rounded-sm border border-white/15 bg-[#12141c] px-3 py-2 text-sm text-pure-paper focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/25";

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

      <div className="space-y-5">
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
          <p className="text-chrome-light leading-relaxed">{product.shortDescription}</p>
        )}

        {mode === "blank" && allowsBlank && (
          <div className="space-y-4 border-t border-white/10 pt-5">
            <p className="text-sm text-chrome-light">
              Purchase a blank {product.name.toLowerCase()} ready for your own use or decoration.
            </p>
            <div>
              <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-pure-paper">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min={product.minQuantity}
                step={product.quantityStep}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || product.minQuantity)}
                className={cn(fieldClass, "w-24")}
              />
              {product.minQuantity > 1 && (
                <p className="mt-1 text-xs text-chrome-mid">Minimum order: {product.minQuantity}</p>
              )}
            </div>
            <Button onClick={handleAddBlank} disabled={adding}>
              {isQuote ? "Contact for quote" : adding ? "Adding…" : "Add to cart"}
            </Button>
          </div>
        )}

        {mode === "customized" && allowsCustom && (
          <div className="space-y-4 border-t border-white/10 pt-5">
            <p className="text-sm text-chrome-light">
              Upload your artwork and we will customize this product for you. Starting at{" "}
              <span className="font-semibold text-pure-paper">
                {formatCurrency(customBase, product.currency)}
              </span>{" "}
              with your own design.
            </p>
            <p className="text-sm text-chrome-mid">
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
