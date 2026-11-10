import type { ArtworkTransform } from "@/lib/artwork-transform";
import type { ProductMockupConfig } from "@/lib/product-mockup-config";

/** "flat" products get a 3D front/back flip; drinkware gets a real 360 turntable. */
export type Product360Kind = "tumbler" | "glass" | "mug" | "flat";

const DRINKWARE_KIND_BY_SLUG: Record<string, Exclude<Product360Kind, "flat">> = {
  tumblers: "tumbler",
  "glass-tumblers": "glass",
  "sublimation-mug": "mug",
};

export function getProduct360Kind(slug?: string): Product360Kind {
  if (!slug) return "flat";
  return DRINKWARE_KIND_BY_SLUG[slug.trim().toLowerCase()] ?? "flat";
}

export interface Product360ViewProps {
  slug: string;
  productName: string;
  frontBaseImage: string;
  backBaseImage: string;
  frontArtworkUrls: string[];
  backArtworkUrls: string[];
  mockupConfig: ProductMockupConfig;
  frontTransform: ArtworkTransform;
  backTransform: ArtworkTransform;
  /** "Print from front to back": the front artwork wraps around the whole product. */
  wrap?: boolean;
  showFront?: boolean;
  showBack?: boolean;
  disclaimer?: string;
}
