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

/** Core shop products — blank and/or customized purchases */
export const SHOP_PRODUCTS: ShopProductCatalogEntry[] = [
  {
    name: "Keychains",
    slug: "keychains",
    sku: "DPM-KEY-ACR",
    price: 5.99,
    categorySlug: "gifts-keepsakes",
    primaryImage: "/products/keychains/blank.png",
    cardImage: "/products/keychains/card.png",
    customizedImage: "/products/keychains/customized.png",
    featured: true,
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
    name: "Tumblers",
    slug: "tumblers",
    sku: "DPM-TUMB",
    price: 19.99,
    categorySlug: "drinkware",
    primaryImage: "/products/tumblers/blank.png",
    cardImage: "/products/tumblers/card.png",
    customizedImage: "/products/tumblers/customized.png",
    featured: true,
  },
  {
    name: "Glass Tumblers",
    slug: "glass-tumblers",
    sku: "DPM-GLASS-TUMB",
    price: 19.99,
    categorySlug: "drinkware",
    primaryImage: "/products/glass-tumblers/blank.png",
    cardImage: "/products/glass-tumblers/card.png",
    customizedImage: "/products/glass-tumblers/customized.png",
    featured: true,
  },
  {
    name: "Sublimation Mug",
    slug: "sublimation-mug",
    sku: "DPM-MUG-SUB",
    price: 14.99,
    categorySlug: "drinkware",
    primaryImage: "/products/sublimation-mug/blank.png",
    cardImage: "/products/sublimation-mug/card.png",
    customizedImage: "/products/sublimation-mug/customized.png",
    featured: true,
  },
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
