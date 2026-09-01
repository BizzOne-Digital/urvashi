"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getProductDisplayImages } from "@/lib/product-catalog";
import { resolveImageSrc } from "@/lib/image-url";
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
  blankImage?: { url: string; alt?: string };
  customizedImage?: { url: string; alt?: string };
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

const COLOR_LABELS: Record<string, string> = {
  "#090909": "Black",
  "#065EE5": "Royal blue",
  "#DE4098": "Magenta",
  "#F3C722": "Yellow",
  "#FEFEFE": "White",
};

function getColorLabel(hex: string): string {
  const normalized = hex.trim().toUpperCase();
  return COLOR_LABELS[normalized] || COLOR_LABELS[hex] || "Custom";
}

function isLightColor(hex: string): boolean {
  const normalized = hex.trim().toUpperCase();
  return normalized === "#FEFEFE" || normalized === "#FFFFFF";
}

export function CustomizerStudio({
  products,
  previewDisclaimer = "Preview only — final placement, colour, and sizing may vary from what is shown on screen.",
  rightsConfirmationCopy = "I confirm that I have the right to use this artwork for printing purposes.",
  className,
}: CustomizerStudioProps) {
  const [selectedId, setSelectedId] = useState(products[0]?._id || "");
  const [text, setText] = useState("Your text");
  const [font, setFont] = useState(DEFAULT_FONTS[0]);
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [artworkAssetId, setArtworkAssetId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);

  const product = products.find((p) => p._id === selectedId) || products[0];
  const fonts = product?.customizer?.allowedFonts?.length ? product.customizer.allowedFonts : DEFAULT_FONTS;
  const colors = product?.customizer?.allowedColors?.length ? product.customizer.allowedColors : DEFAULT_COLORS;
  const printArea = product?.customizer?.printArea || { x: 12, y: 18, width: 76, height: 58 };

  const { blank } = product ? getProductDisplayImages(product) : { blank: undefined };
  const baseImage = resolveImageSrc(blank?.url || product?.images?.[0]?.url);

  useEffect(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setArtworkAssetId(null);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps -- reset artwork when product changes

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

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
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

  const fieldClass =
    "w-full rounded-sm border border-white/15 bg-[#12141c] px-4 py-3 text-sm text-pure-paper placeholder:text-chrome-mid focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/25";
  const selectClass = cn(fieldClass, "[&>option]:bg-ink-black [&>option]:text-pure-paper");

  if (products.length === 0) {
    return (
      <p className="text-center text-chrome-light">
        No customizable products available right now. Browse the{" "}
        <Link href="/shop" className="text-cyan underline">shop</Link> or{" "}
        <Link href="/contact" className="text-cyan underline">contact us</Link>.
      </p>
    );
  }

  const priceDisplay = product ? getProductPriceDisplay(product, product.currency) : { display: "", isQuote: false };
  const disclaimer =
    product?.customizer?.previewDisclaimer || previewDisclaimer;

  return (
    <div className={cn("mx-auto w-full", className)}>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Live preview */}
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">Live preview</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-pure-paper">
            {product?.name}
          </h2>

          <div className="relative mt-6 overflow-hidden rounded-xl border border-white/10 bg-[#0a0c14]/80 p-4 shadow-[0_0_40px_rgba(6,94,229,0.15)]">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-[#12141c] to-[#0a0c14]">
              <Image
                src={baseImage}
                alt={product?.name || "Product preview"}
                fill
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              <div
                className="absolute overflow-hidden rounded-sm border border-dashed border-cyan/40 bg-white/5"
                style={{
                  left: `${printArea.x}%`,
                  top: `${printArea.y}%`,
                  width: `${printArea.width}%`,
                  height: `${printArea.height}%`,
                }}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Your artwork preview" className="h-full w-full object-contain p-1" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-2 text-center">
                    <span
                      className="max-w-full break-words leading-tight"
                      style={{
                        fontFamily: font,
                        color: color,
                        fontSize: "clamp(10px, 4vw, 22px)",
                        fontWeight: 700,
                      }}
                    >
                      {text || "Your text"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-chrome-mid">{disclaimer}</p>
          <p className="mt-2 text-sm text-chrome-light">
            Or{" "}
            <Link href={`/shop/${product?.slug}/customize`} className="text-cyan hover:underline">
              open full customization for {product?.name}
            </Link>
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-5 rounded-xl border border-white/10 bg-[#050508] p-5 shadow-[0_0_40px_rgba(6,94,229,0.12)] sm:p-6">
          <div>
            <label htmlFor="product-select" className="mb-1 block text-sm font-medium text-pure-paper">
              Product
            </label>
            <select
              id="product-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className={selectClass}
            >
              {products.map((p) => (
                <option key={p._id} value={p._id} className="bg-[#12141c]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="custom-text" className="mb-1 block text-sm font-medium text-pure-paper">
              Custom text
            </label>
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
              <label htmlFor="font-select" className="mb-1 block text-sm font-medium text-pure-paper">
                Font
              </label>
              <select
                id="font-select"
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className={selectClass}
              >
                {fonts.map((f) => (
                  <option key={f} value={f} className="bg-[#12141c]">{f}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-2 block text-sm font-medium text-pure-paper">Colour</p>
              <div className="flex flex-wrap gap-3" role="listbox" aria-label="Choose a colour">
                {colors.map((c) => {
                  const selected = color === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      aria-label={getColorLabel(c)}
                      onClick={() => setColor(c)}
                      className="group flex flex-col items-center gap-1.5 rounded-sm p-1 transition-transform hover:scale-105"
                    >
                      <span
                        className={cn(
                          "h-10 w-10 rounded-full border-2 shadow-sm transition-all",
                          isLightColor(c) ? "border-chrome-mid/60" : "border-transparent",
                          selected
                            ? "ring-2 ring-cyan ring-offset-2 ring-offset-[#0a0c14] scale-110 shadow-[0_0_12px_rgba(13,151,252,0.45)]"
                            : "group-hover:ring-2 group-hover:ring-chrome-mid/40 group-hover:ring-offset-1 group-hover:ring-offset-[#0a0c14]"
                        )}
                        style={{ backgroundColor: c }}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wide",
                          selected ? "text-cyan" : "text-chrome-mid group-hover:text-chrome-light"
                        )}
                      >
                        {getColorLabel(c)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-start gap-2 text-sm text-chrome-light">
              <input
                type="checkbox"
                checked={rightsConfirmed}
                onChange={(e) => setRightsConfirmed(e.target.checked)}
                className="mt-1 accent-cyan"
              />
              <span>{rightsConfirmationCopy}</span>
            </label>
            <label className="mb-1 block text-sm font-medium text-pure-paper">
              Upload artwork (optional)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              onChange={handleUpload}
              disabled={uploading || !rightsConfirmed}
              className="block w-full text-sm text-chrome-light file:mr-3 file:rounded-sm file:border-0 file:bg-cyan/20 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-cyan hover:file:bg-cyan/30"
            />
            {uploading && <p className="mt-1 text-xs text-chrome-mid">Uploading…</p>}
            {previewUrl && (
              <p className="mt-1 text-xs text-cyan">Artwork added — shown in preview above.</p>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold text-pure-paper">{priceDisplay.display}</p>
            <Button onClick={handleAddToCart} disabled={adding || priceDisplay.isQuote} className="w-full sm:w-auto">
              {priceDisplay.isQuote ? "Contact for quote" : adding ? "Adding…" : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
