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
  { slug: "keychains", displayName: "Keychains", price: 5.99 },
  { slug: "sublimation-keychains", displayName: "Sublimation keychains", price: 5.99 },
  { slug: "tumblers", displayName: "Tumblers", price: 19.99 },
  { slug: "glass-tumblers", displayName: "Glass tumblers", price: 19.99 },
  { slug: "sublimation-mug", displayName: "Sublimation mug", price: 14.99 },
  {
    slug: "sublimation-pens",
    displayName: "Sublimation pens",
    price: 3.99,
    minQuantity: 5,
    note: "Minimum order 5 pens",
  },
  { slug: "sublimation-ornaments", displayName: "Sublimation ornaments", price: 5.99 },
  { slug: "sublimation-desk-calendar", displayName: "Sublimation desk calendar", price: 29.99 },
];

export function getPricingCatalogSlugs(): string[] {
  return PRICING_CATALOG.map((entry) => entry.slug);
}
