"use client";

import Image from "next/image";
import { ProductMockupPreview } from "@/components/customize/ProductMockupPreview";
import { getBackPrintArea, type ProductMockupConfig } from "@/lib/product-mockup-config";
import type { ArtworkTransform } from "@/lib/artwork-transform";
import { cn } from "@/lib/utils";

interface ProductDualSideCustomizePreviewProps {
  productName: string;
  baseImageSrc: string;
  backImageSrc?: string;
  frontArtworkUrls: string[];
  backArtworkUrls: string[];
  mockupConfig: ProductMockupConfig;
  frontTransform: ArtworkTransform;
  backTransform: ArtworkTransform;
  onFrontTransformChange: (transform: ArtworkTransform) => void;
  onBackTransformChange: (transform: ArtworkTransform) => void;
  disclaimer?: string;
  className?: string;
  showFront?: boolean;
  showBack?: boolean;
  simpleSideLabels?: boolean;
  previewMode?: "edit" | "estimate";
  referenceImageSrc?: string;
  referenceImageAlt?: string;
}

export function ProductDualSideCustomizePreview({
  productName,
  baseImageSrc,
  backImageSrc,
  frontArtworkUrls,
  backArtworkUrls,
  mockupConfig,
  frontTransform,
  backTransform,
  onFrontTransformChange,
  onBackTransformChange,
  disclaimer,
  className,
  showFront = true,
  showBack = true,
  simpleSideLabels = true,
  previewMode = "edit",
  referenceImageSrc,
  referenceImageAlt,
}: ProductDualSideCustomizePreviewProps) {
  const backPrintArea = getBackPrintArea(mockupConfig);
  const isEstimate = previewMode === "estimate";
  const cols =
    isEstimate && referenceImageSrc
      ? "lg:grid-cols-[1fr_minmax(0,11rem)]"
      : showFront && showBack
        ? "sm:grid-cols-2"
        : "sm:grid-cols-1";

  const estimateDisclaimer =
    disclaimer ||
    "Approximate preview for your approval. Final print colour, size, and placement may vary slightly from this estimate.";

  return (
    <div className={cn("min-w-0", className)}>
      {isEstimate && (
        <p className="mb-4 text-sm text-chrome-light">
          Review how your artwork looks on the product before checkout. Switch back to{" "}
          <span className="text-pure-paper">Adjust placement</span> anytime to move or resize your design.
        </p>
      )}
      <div className={cn("grid gap-4", cols)}>
        <div className={cn("grid gap-4", showFront && showBack && !referenceImageSrc ? "sm:grid-cols-2" : "grid-cols-1")}>
          {showFront && (
            <ProductMockupPreview
              productName={simpleSideLabels ? "Front" : `${productName} — Front`}
              sideLabelOnly={simpleSideLabels && !isEstimate}
              previewMode={previewMode}
              estimateArtworkBlend={mockupConfig.estimateArtworkBlend}
              baseImageSrc={baseImageSrc}
              artworkUrls={frontArtworkUrls}
              printArea={mockupConfig.printArea}
              roundedPrintArea={mockupConfig.rounded}
              borderRadius={mockupConfig.borderRadius}
              interactive
              artworkTransform={frontTransform}
              onArtworkTransformChange={onFrontTransformChange}
              emptyHint="Upload front artwork to preview"
              disclaimer={isEstimate ? estimateDisclaimer : ""}
              className="min-w-0"
            />
          )}
          {showBack && (
            <ProductMockupPreview
              productName={simpleSideLabels ? "Back" : `${productName} — Back`}
              sideLabelOnly={simpleSideLabels && !isEstimate}
              previewMode={previewMode}
              estimateArtworkBlend={mockupConfig.estimateArtworkBlend}
              baseImageSrc={backImageSrc || baseImageSrc}
              artworkUrls={backArtworkUrls}
              printArea={backPrintArea}
              roundedPrintArea={mockupConfig.rounded}
              borderRadius={mockupConfig.borderRadius}
              interactive
              artworkTransform={backTransform}
              onArtworkTransformChange={onBackTransformChange}
              emptyHint="Upload back artwork to preview (optional)"
              disclaimer={isEstimate ? estimateDisclaimer : ""}
              className="min-w-0"
            />
          )}
        </div>
        {isEstimate && referenceImageSrc && (
          <aside className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-6 lg:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan">Finished example</p>
            <p className="mt-1 text-xs text-chrome-mid">Quality reference from our shop (not your file).</p>
            <div className="relative mt-3 aspect-square overflow-hidden rounded-lg bg-[#f4f4f5]">
              <Image
                src={referenceImageSrc}
                alt={referenceImageAlt || `${productName} example`}
                fill
                className="object-contain p-2"
                sizes="176px"
              />
            </div>
          </aside>
        )}
      </div>
      {!isEstimate && disclaimer && (
        <p className="mt-3 text-xs leading-relaxed text-chrome-mid">{disclaimer}</p>
      )}
    </div>
  );
}
