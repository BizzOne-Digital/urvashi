/** Core shop products — blank and/or customized purchases */
export const SHOP_PRODUCTS = [
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
] as const;

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
