export interface PricingCatalogEntry {
  slug: string;
  displayName: string;
  price?: number;
  minQuantity?: number;
  quote?: boolean;
  note?: string;
}

/** Canonical product pricing for DPM Custom Prints */
export const PRICING_CATALOG: PricingCatalogEntry[] = [
  { slug: "custom-white-mug-11oz", displayName: "Custom white mug 11oz", price: 14.99 },
  { slug: "tumbler", displayName: "Tumbler", price: 19.99 },
  { slug: "key-chain", displayName: "Key chain", price: 5.99 },
  { slug: "t-shirt-front-only", displayName: "T-shirt (front only)", price: 19.99 },
  { slug: "t-shirt-front-and-back", displayName: "T-shirt (front and back)", price: 25.99 },
  { slug: "calendar", displayName: "Calendar", price: 29.99 },
  {
    slug: "custom-pen",
    displayName: "Custom pen",
    price: 3.99,
    minQuantity: 5,
    note: "Minimum order 5 pens",
  },
  { slug: "round-ornament", displayName: "Round ornament", price: 5.99 },
  { slug: "magnet", displayName: "Magnet", price: 9.99 },
  { slug: "blanket-cover", displayName: "Blanket cover", quote: true },
  { slug: "couch-pillow-case", displayName: "Couch pillow case", quote: true },
  { slug: "cap", displayName: "Cap", quote: true },
  { slug: "hoodie", displayName: "Hoodie", quote: true },
];

export function getPricingCatalogSlugs(): string[] {
  return PRICING_CATALOG.map((entry) => entry.slug);
}
