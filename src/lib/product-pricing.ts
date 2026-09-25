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
  { slug: "custom-tote-bags", displayName: "Custom tote bags (beige)", price: 9.99 },
  { slug: "caps", displayName: "Caps", price: 12.99, note: "Red, black, or navy blue" },
  {
    slug: "custom-t-shirt-half-sleeve",
    displayName: "Custom t-shirt — half sleeve",
    price: 19.99,
    note: "One-side $19.99 · front & back $25.99",
  },
  {
    slug: "custom-t-shirt-full-sleeve",
    displayName: "Custom t-shirt — full sleeve",
    price: 22.99,
    note: "One-side $22.99 · front & back $27.99",
  },
  {
    slug: "custom-hoodies",
    displayName: "Custom hoodies",
    price: 35.99,
    note: "One-side $35.99 · front & back $39.99",
  },
  {
    slug: "fridge-magnets",
    displayName: "Fridge magnets",
    price: 9.99,
    note: "Round, heart, rectangle, or square",
  },
];

export function getPricingCatalogSlugs(): string[] {
  return PRICING_CATALOG.map((entry) => entry.slug);
}
