export interface ShopProductVariantOption {
  label: string;
  value: string;
  surcharge?: number;
}

export interface ShopProductVariant {
  name: string;
  options: ShopProductVariantOption[];
}

export interface ShopPrintLocation {
  id: string;
  label: string;
  surcharge?: number;
}

export interface ShopProductCatalogEntry {
  name: string;
  slug: string;
  sku: string;
  price: number;
  categorySlug: string;
  primaryImage: string;
  cardImage?: string;
  customizedImage: string;
  featured?: boolean;
  minQuantity?: number;
  shortDescription?: string;
  longDescription?: string;
  variants?: ShopProductVariant[];
  printLocations?: ShopPrintLocation[];
}

const APPAREL_COLORS = [
  { label: "Black", value: "black" },
  { label: "White", value: "white" },
  { label: "Navy blue", value: "navy-blue" },
  { label: "Dark green", value: "dark-green" },
] as const;

const T_SHIRT_SIZES = [
  { label: "Small", value: "s" },
  { label: "Med", value: "m" },
  { label: "Large", value: "l" },
  { label: "XL", value: "xl" },
] as const;

const HOODIE_SIZES = [
  { label: "Med", value: "m" },
  { label: "Large", value: "l" },
] as const;

const ONE_SIDE_AND_BOTH_PRINT = (bothSidesSurcharge: number): ShopPrintLocation[] => [
  { id: "front", label: "One side print", surcharge: 0 },
  { id: "front_and_back", label: "Front & back print", surcharge: bothSidesSurcharge },
];

/** Best sellers — listed first in shop (lower sort order = higher on page). */
export const SHOP_HOT_SELLING_SLUG_ORDER = [
  "custom-tote-bags",
  "sublimation-mug",
  "tumblers",
  "glass-tumblers",
  "custom-t-shirt-half-sleeve",
  "custom-t-shirt-full-sleeve",
] as const;

/** Core shop products — blank and/or customized purchases */
export const SHOP_PRODUCTS: ShopProductCatalogEntry[] = [
  {
    name: "Custom Tote Bags",
    slug: "custom-tote-bags",
    sku: "DPM-TOTE",
    price: 9.99,
    categorySlug: "business-promotional",
    primaryImage: "/products/custom-tote-bags/blank.jpg",
    cardImage: "/products/custom-tote-bags/card.jpg",
    customizedImage: "/products/custom-tote-bags/customized.jpg",
    featured: true,
    shortDescription:
      "Beige custom tote bags — $9.99 CAD. Upload your artwork for a personalized print.",
    variants: [
      {
        name: "Colour",
        options: [{ label: "Beige", value: "beige" }],
      },
    ],
  },
  {
    name: "Sublimation Mug (11 oz)",
    slug: "sublimation-mug",
    sku: "DPM-MUG-SUB",
    price: 14.99,
    categorySlug: "drinkware",
    primaryImage: "/products/sublimation-mug/blank.png",
    cardImage: "/products/sublimation-mug/card.png",
    customizedImage: "/products/sublimation-mug/customized.png",
    featured: true,
    shortDescription: "11 oz sublimation mug — $14.99 CAD. Upload your artwork for a full-wrap print.",
    longDescription:
      "Classic 11 oz ceramic sublimation mug. Upload your design on the customize page for vibrant, dishwasher-safe printing.",
  },
  {
    name: "Tumblers (20 oz)",
    slug: "tumblers",
    sku: "DPM-TUMB",
    price: 19.99,
    categorySlug: "drinkware",
    primaryImage: "/products/tumblers/blank.png",
    cardImage: "/products/tumblers/card.png",
    customizedImage: "/products/tumblers/customized.png",
    featured: true,
    shortDescription: "20 oz tumbler — $19.99 CAD. Custom sublimation print; front or wrap options.",
    longDescription:
      "20 oz insulated tumbler with custom sublimation printing. Choose front print or a front-to-back wrap and upload your artwork on the customize page.",
  },
  {
    name: "Glass Tumblers (16 oz)",
    slug: "glass-tumblers",
    sku: "DPM-GLASS-TUMB",
    price: 19.99,
    categorySlug: "drinkware",
    primaryImage: "/products/glass-tumblers/blank.png",
    cardImage: "/products/glass-tumblers/card.png",
    customizedImage: "/products/glass-tumblers/customized.png",
    featured: true,
    shortDescription: "16 oz glass tumbler — $19.99 CAD. Bamboo lid and custom print.",
    longDescription:
      "16 oz clear glass tumbler with bamboo lid (straw where included). Add your artwork for a custom sublimation print on the customize page.",
  },
  {
    name: "Custom T-Shirt — Half Sleeve",
    slug: "custom-t-shirt-half-sleeve",
    sku: "DPM-TSH-HALF",
    price: 19.99,
    categorySlug: "apparel",
    primaryImage: "/products/custom-t-shirt-half-sleeve/blank.jpg",
    cardImage: "/products/custom-t-shirt-half-sleeve/card.jpg",
    customizedImage: "/products/custom-t-shirt-half-sleeve/customized.jpg",
    featured: true,
    shortDescription:
      "Round neck half-sleeve tees in black, white, navy blue, or dark green. One-side print from $19.99; front & back $25.99.",
    longDescription:
      "Round neck half-sleeve custom t-shirts, in stock in black, white, navy blue, and dark green. Choose one-side print ($19.99) or front and back ($25.99). Upload your artwork on the customize page.",
    variants: [
      { name: "Colour", options: [...APPAREL_COLORS] },
      { name: "Size", options: [...T_SHIRT_SIZES] },
    ],
    printLocations: ONE_SIDE_AND_BOTH_PRINT(6),
  },
  {
    name: "Custom T-Shirt — Full Sleeve",
    slug: "custom-t-shirt-full-sleeve",
    sku: "DPM-TSH-FULL",
    price: 22.99,
    categorySlug: "apparel",
    primaryImage: "/products/custom-t-shirt-full-sleeve/blank.jpg",
    cardImage: "/products/custom-t-shirt-full-sleeve/card.jpg",
    customizedImage: "/products/custom-t-shirt-full-sleeve/customized.jpg",
    featured: true,
    shortDescription:
      "Round neck full-sleeve tees in black, white, navy blue, or dark green. One-side print from $22.99; front & back $27.99.",
    longDescription:
      "Round neck full-sleeve custom t-shirts, in stock in black, white, navy blue, and dark green. Choose one-side print ($22.99) or front and back ($27.99). Upload your artwork on the customize page.",
    variants: [
      { name: "Colour", options: [...APPAREL_COLORS] },
      { name: "Size", options: [...T_SHIRT_SIZES] },
    ],
    printLocations: ONE_SIDE_AND_BOTH_PRINT(5),
  },
  {
    name: "Acrylic UV Keychains",
    slug: "keychains",
    sku: "DPM-KEY-ACR",
    price: 5.99,
    categorySlug: "gifts-keepsakes",
    primaryImage: "/products/keychains/blank.png",
    cardImage: "/products/keychains/card.png",
    customizedImage: "/products/keychains/customized.png",
    featured: true,
    shortDescription:
      "Acrylic UV keychains — one-sided print from $5.99 CAD. Round, heart, hexagon, square, or rectangle sizes.",
    longDescription:
      "Clear acrylic keychains with vibrant one-sided UV printing. Choose your shape and size, upload front artwork only, and we print on one face of the acrylic.",
    variants: [
      {
        name: "Shape & size",
        options: [
          { label: "Round — 2 in", value: "round" },
          { label: "Heart — 2 in", value: "heart" },
          { label: "Hexagon — 2 in", value: "hexagon" },
          { label: "Square — 2 in", value: "square" },
          { label: "Rectangle — 2×3 in", value: "rectangle" },
        ],
      },
    ],
  },
  {
    name: "Sublimation Keychains",
    slug: "sublimation-keychains",
    sku: "DPM-KEY-SUB",
    price: 5.99,
    categorySlug: "gifts-keepsakes",
    primaryImage: "/products/sublimation-keychains/blank.png",
    cardImage: "/products/sublimation-keychains/card.png",
    customizedImage: "/products/sublimation-keychains/customized.png",
    featured: true,
    shortDescription:
      "Double-sided sublimation keychains — $5.99 CAD. Rectangle shape, one standard size.",
    longDescription:
      "Metal sublimation keychains with full colour printing on both sides. Rectangle format only (one size). Upload front and back artwork on the customize page.",
  },
  {
    name: "Sublimation Desk Calendar",
    slug: "sublimation-desk-calendar",
    sku: "DPM-CAL-DESK",
    price: 29.99,
    categorySlug: "seasonal",
    primaryImage: "/products/sublimation-desk-calendar/blank.png",
    cardImage: "/products/sublimation-desk-calendar/card.png",
    customizedImage: "/products/sublimation-desk-calendar/customized.png",
    featured: true,
  },
  {
    name: "Sublimation Pens",
    slug: "sublimation-pens",
    sku: "DPM-PEN-SUB",
    price: 3.99,
    minQuantity: 5,
    categorySlug: "business-promotional",
    primaryImage: "/products/sublimation-pens/blank.png",
    cardImage: "/products/sublimation-pens/card.png",
    customizedImage: "/products/sublimation-pens/customized.png",
    featured: true,
  },
  {
    name: "Sublimation Ornaments",
    slug: "sublimation-ornaments",
    sku: "DPM-ORN-SUB",
    price: 5.99,
    categorySlug: "seasonal",
    primaryImage: "/products/sublimation-ornaments/blank.png",
    cardImage: "/products/sublimation-ornaments/card.png",
    customizedImage: "/products/sublimation-ornaments/customized.png",
    featured: true,
  },
  {
    name: "Caps",
    slug: "caps",
    sku: "DPM-CAP",
    price: 12.99,
    categorySlug: "apparel",
    primaryImage: "/products/caps/blank.jpg",
    cardImage: "/products/caps/card.jpg",
    customizedImage: "/products/caps/customized.jpg",
    featured: true,
    shortDescription: "Custom caps in red, black, or navy blue — $12.99 CAD, in stock.",
    variants: [
      {
        name: "Colour",
        options: [
          { label: "Red", value: "red" },
          { label: "Black", value: "black" },
          { label: "Navy blue", value: "navy-blue" },
        ],
      },
    ],
  },
  {
    name: "Custom Hoodies",
    slug: "custom-hoodies",
    sku: "DPM-HOODIE",
    price: 35.99,
    categorySlug: "apparel",
    primaryImage: "/products/custom-hoodies/blank.jpg",
    cardImage: "/products/custom-hoodies/card.jpg",
    customizedImage: "/products/custom-hoodies/customized.jpg",
    featured: true,
    shortDescription:
      "Hoodies in black, red, navy blue, or dark green. One-side print from $35.99; front & back $39.99.",
    longDescription:
      "Custom hoodies in stock in black, red, navy blue, and dark green. Choose one-side print ($35.99) or front and back ($39.99).",
    variants: [
      {
        name: "Colour",
        options: [
          { label: "Black", value: "black" },
          { label: "Red", value: "red" },
          { label: "Navy blue", value: "navy-blue" },
          { label: "Dark green", value: "dark-green" },
        ],
      },
      { name: "Size", options: [...HOODIE_SIZES] },
    ],
    printLocations: ONE_SIDE_AND_BOTH_PRINT(4),
  },
  {
    name: "Fridge Magnets",
    slug: "fridge-magnets",
    sku: "DPM-MAG-FRIDGE",
    price: 9.99,
    categorySlug: "gifts-keepsakes",
    primaryImage: "/products/fridge-magnets/blank.jpg",
    cardImage: "/products/fridge-magnets/card.jpg",
    customizedImage: "/products/fridge-magnets/customized.jpg",
    featured: true,
    shortDescription:
      "Custom fridge magnets — $9.99 CAD. Round, heart, rectangle, or square (one size). In stock.",
    variants: [
      {
        name: "Shape",
        options: [
          { label: "Round", value: "round" },
          { label: "Heart", value: "heart" },
          { label: "Rectangle", value: "rectangle" },
          { label: "Square", value: "square" },
        ],
      },
    ],
  },
];

const SHOP_SORT_AFTER_HOT_BASE = 100;

export function getShopSortOrderForSlug(slug: string): number {
  const hotIndex = SHOP_HOT_SELLING_SLUG_ORDER.indexOf(
    slug as (typeof SHOP_HOT_SELLING_SLUG_ORDER)[number]
  );
  if (hotIndex >= 0) return hotIndex;

  const catalogIndex = SHOP_PRODUCTS.findIndex((p) => p.slug === slug);
  return SHOP_SORT_AFTER_HOT_BASE + (catalogIndex >= 0 ? catalogIndex : 999);
}

export const DESIGN_HELP_SURCHARGE = 5;

export function getProductDisplayImages(product: {
  blankImage?: { url: string; alt?: string };
  customizedImage?: { url: string; alt?: string };
  images?: Array<{ url: string; alt?: string }>;
  name: string;
}) {
  const blank =
    product.blankImage ||
    product.images?.[0] ||
    undefined;
  const customized =
    product.customizedImage ||
    product.images?.[1] ||
    product.images?.[0] ||
    undefined;

  return {
    blank: blank ? { ...blank, alt: blank.alt || `${product.name} blank` } : undefined,
    customized: customized
      ? { ...customized, alt: customized.alt || `${product.name} customized` }
      : undefined,
  };
}
