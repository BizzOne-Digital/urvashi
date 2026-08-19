"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getProductPriceDisplay } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface CustomizerProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  pricingMode: "fixed" | "quote";
  price?: number;
  currency?: string;
  minQuantity: number;
  availability?: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order" | "quote_only";
  images?: Array<{ url: string; alt?: string }>;
  customizer?: {
    enabled?: boolean;
    allowedFonts?: string[];
    allowedColors?: string[];
    previewDisclaimer?: string;
    printArea?: { x: number; y: number; width: number; height: number };
  };
}

interface CustomizerStudioProps {
  products: CustomizerProduct[];
  previewDisclaimer?: string;
  rightsConfirmationCopy?: string;
  className?: string;
}

const DEFAULT_FONTS = ["Inter", "Georgia", "Arial", "Impact"];
const DEFAULT_COLORS = ["#090909", "#065EE5", "#DE4098", "#F3C722", "#FEFEFE"];

export function CustomizerStudio({
  products,
  rightsConfirmationCopy = "I confirm that I have the right to use this artwork for printing purposes.",
  className,
}: CustomizerStudioProps) {
  const [selectedId, setSelectedId] = useState(products[0]?._id || "");
  const [text, setText] = useState("Your text");
  const [font, setFont] = useState(DEFAULT_FONTS[0]);
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [artworkAssetId, setArtworkAssetId] = useState<string | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);

  const product = products.find((p) => p._id === selectedId) || products[0];
  const fonts = product?.customizer?.allowedFonts?.length ? product.customizer.allowedFonts : DEFAULT_FONTS;
  const colors = product?.customizer?.allowedColors?.length ? product.customizer.allowedColors : DEFAULT_COLORS;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!rightsConfirmed) {
      toast.error("Please confirm artwork rights before uploading");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("rightsConfirmed", "true");

      const res = await fetch("/api/upload/artwork", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setArtworkAssetId(json.artwork?.id || json.artwork?._id);
      toast.success("Artwork uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
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
            productName: product.name,
            sku: product.sku,
            quantity: product.minQuantity || 1,
            pricingMode: product.pricingMode,
            customization: {
              text,
              font,
              color,
              artworkAssetId: artworkAssetId || undefined,
              configSnapshot: { text, font, color },
            },
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add to cart");
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (products.length === 0) {
    return (
      <p className="text-center text-carbon">
        No customizable products available right now. Browse the{" "}
        <Link href="/shop" className="text-royal-blue underline">shop</Link> or{" "}
        <Link href="/contact" className="text-royal-blue underline">contact us</Link>.
      </p>
    );
  }

  const priceDisplay = product ? getProductPriceDisplay(product, product.currency) : { display: "", isQuote: false };
  const fieldClass = "w-full rounded-sm border border-chrome-light bg-pure-paper px-4 py-3 text-sm";

  return (
    <div className={cn("mx-auto w-full max-w-lg", className)}>
      <div className="space-y-6 rounded-sm border border-chrome-light/60 bg-pure-paper p-6 shadow-sm sm:p-8">
        <div>
          <label htmlFor="product-select" className="mb-1 block text-sm font-medium">Product</label>
          <select
            id="product-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className={fieldClass}
          >
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="custom-text" className="mb-1 block text-sm font-medium">Custom text</label>
          <input
            id="custom-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={50}
            className={fieldClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="font-select" className="mb-1 block text-sm font-medium">Font</label>
            <select id="font-select" value={font} onChange={(e) => setFont(e.target.value)} className={fieldClass}>
              {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="color-select" className="mb-1 block text-sm font-medium">Colour</label>
            <select id="color-select" value={color} onChange={(e) => setColor(e.target.value)} className={fieldClass}>
              {colors.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-start gap-2 text-sm">
            <input type="checkbox" checked={rightsConfirmed} onChange={(e) => setRightsConfirmed(e.target.checked)} className="mt-1" />
            <span>{rightsConfirmationCopy}</span>
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            onChange={handleUpload}
            disabled={uploading || !rightsConfirmed}
            className="block w-full text-sm"
          />
          {uploading && <p className="mt-1 text-xs text-chrome-mid">Uploading…</p>}
        </div>

        <div className="flex min-w-0 flex-col gap-4 border-t border-chrome-light/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">{priceDisplay.display}</p>
          <Button onClick={handleAddToCart} disabled={adding || priceDisplay.isQuote} className="w-full sm:w-auto">
            {priceDisplay.isQuote ? "Contact for quote" : adding ? "Adding…" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
