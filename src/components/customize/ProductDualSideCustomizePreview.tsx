"use client";

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
}: ProductDualSideCustomizePreviewProps) {
  const backPrintArea = getBackPrintArea(mockupConfig);
  const cols = showFront && showBack ? "sm:grid-cols-2" : "sm:grid-cols-1";

  return (
    <div className={cn("min-w-0", className)}>
      <div className={cn("grid gap-4", cols)}>
        {showFront && (
        <ProductMockupPreview
          productName={simpleSideLabels ? "Front" : `${productName} — Front`}
          sideLabelOnly={simpleSideLabels}
          baseImageSrc={baseImageSrc}
          artworkUrls={frontArtworkUrls}
          printArea={mockupConfig.printArea}
          roundedPrintArea={mockupConfig.rounded}
          borderRadius={mockupConfig.borderRadius}
          interactive
          artworkTransform={frontTransform}
          onArtworkTransformChange={onFrontTransformChange}
          emptyHint="Upload front artwork to preview"
          disclaimer=""
          className="min-w-0"
        />
        )}
        {showBack && (
        <ProductMockupPreview
          productName={simpleSideLabels ? "Back" : `${productName} — Back`}
          sideLabelOnly={simpleSideLabels}
          baseImageSrc={backImageSrc || baseImageSrc}
          artworkUrls={backArtworkUrls}
          printArea={backPrintArea}
          roundedPrintArea={mockupConfig.rounded}
          borderRadius={mockupConfig.borderRadius}
          interactive
          artworkTransform={backTransform}
          onArtworkTransformChange={onBackTransformChange}
          emptyHint="Upload back artwork to preview (optional)"
          disclaimer=""
          className="min-w-0"
        />
        )}
      </div>
      {disclaimer && (
        <p className="mt-3 text-xs leading-relaxed text-chrome-mid">{disclaimer}</p>
      )}
    </div>
  );
}
