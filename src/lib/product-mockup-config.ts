import { DEFAULT_PRINT_AREA, type PrintAreaRect } from "@/lib/mockup-preview";
import { isCalendarProduct } from "@/lib/calendar-customize";

export interface ProductMockupConfig {
  printArea: PrintAreaRect;
  backPrintArea?: PrintAreaRect;
  /** Tighter corners for cylindrical drinkware, etc. */
  rounded?: boolean;
  borderRadius?: string;
}

export interface ProductMockupSideImages {
  front: string;
  back: string;
}

/** Front/back blank photos for the customize preview (odd/even pairs from client assets). */
const PRODUCT_MOCKUP_SIDES_BY_SLUG: Record<string, ProductMockupSideImages> = {
  keychains: {
    front: "/products/keychains/mockup-front.jpg",
    back: "/products/keychains/mockup-back.jpg",
  },
  "glass-tumblers": {
    front: "/products/glass-tumblers/mockup-front.jpg",
    back: "/products/glass-tumblers/mockup-back.jpg",
  },
  "sublimation-desk-calendar": {
    front: "/products/sublimation-desk-calendar/mockup-front.jpg",
    back: "/products/sublimation-desk-calendar/mockup-back.jpg",
  },
  "sublimation-keychains": {
    front: "/products/sublimation-keychains/mockup-front.jpg",
    back: "/products/sublimation-keychains/mockup-back.jpg",
  },
  "sublimation-mug": {
    front: "/products/sublimation-mug/mockup-front.jpg",
    back: "/products/sublimation-mug/mockup-back.jpg",
  },
  "sublimation-pens": {
    front: "/products/sublimation-pens/mockup-front.jpg",
    back: "/products/sublimation-pens/mockup-back.jpg",
  },
  tumblers: {
    front: "/products/tumblers/mockup-front.jpg",
    back: "/products/tumblers/mockup-back.jpg",
  },
  caps: {
    front: "/products/caps/colors/black/front.jpg",
    back: "/products/caps/colors/black/back.jpg",
  },
  "custom-t-shirt-half-sleeve": {
    front: "/products/custom-t-shirt-half-sleeve/colors/black/front.jpg",
    back: "/products/custom-t-shirt-half-sleeve/colors/black/back.jpg",
  },
  "custom-t-shirt-full-sleeve": {
    front: "/products/custom-t-shirt-full-sleeve/colors/black/front.jpg",
    back: "/products/custom-t-shirt-full-sleeve/colors/black/back.jpg",
  },
  "custom-hoodies": {
    front: "/products/custom-hoodies/colors/black/front.jpg",
    back: "/products/custom-hoodies/colors/black/back.jpg",
  },
  "custom-tote-bags": {
    front: "/products/custom-tote-bags/mockup-front.jpg",
    back: "/products/custom-tote-bags/mockup-back.jpg",
  },
  "fridge-magnets": {
    front: "/products/fridge-magnets/shapes/round.jpg",
    back: "/products/fridge-magnets/shapes/round.jpg",
  },
};

/** Per colour (variant value) mockups — e.g. apparel blank front/back photos. */
const PRODUCT_MOCKUP_SIDES_BY_SLUG_AND_COLOR: Record<string, Record<string, ProductMockupSideImages>> = {
  caps: {
    red: {
      front: "/products/caps/colors/red/front.jpg",
      back: "/products/caps/colors/red/back.jpg",
    },
    black: {
      front: "/products/caps/colors/black/front.jpg",
      back: "/products/caps/colors/black/back.jpg",
    },
    "navy-blue": {
      front: "/products/caps/colors/navy-blue/front.jpg",
      back: "/products/caps/colors/navy-blue/back.jpg",
    },
  },
  "custom-t-shirt-half-sleeve": {
    black: {
      front: "/products/custom-t-shirt-half-sleeve/colors/black/front.jpg",
      back: "/products/custom-t-shirt-half-sleeve/colors/black/back.jpg",
    },
    white: {
      front: "/products/custom-t-shirt-half-sleeve/colors/white/front.jpg",
      back: "/products/custom-t-shirt-half-sleeve/colors/white/back.jpg",
    },
    "navy-blue": {
      front: "/products/custom-t-shirt-half-sleeve/colors/navy-blue/front.jpg",
      back: "/products/custom-t-shirt-half-sleeve/colors/navy-blue/back.jpg",
    },
    "dark-green": {
      front: "/products/custom-t-shirt-half-sleeve/colors/dark-green/front.jpg",
      back: "/products/custom-t-shirt-half-sleeve/colors/dark-green/back.jpg",
    },
  },
  "custom-hoodies": {
    black: {
      front: "/products/custom-hoodies/colors/black/front.jpg",
      back: "/products/custom-hoodies/colors/black/back.jpg",
    },
    red: {
      front: "/products/custom-hoodies/colors/red/front.jpg",
      back: "/products/custom-hoodies/colors/red/back.jpg",
    },
    "navy-blue": {
      front: "/products/custom-hoodies/colors/navy-blue/front.jpg",
      back: "/products/custom-hoodies/colors/navy-blue/back.jpg",
    },
    "dark-green": {
      front: "/products/custom-hoodies/colors/dark-green/front.jpg",
      back: "/products/custom-hoodies/colors/dark-green/back.jpg",
    },
  },
  "custom-t-shirt-full-sleeve": {
    black: {
      front: "/products/custom-t-shirt-full-sleeve/colors/black/front.jpg",
      back: "/products/custom-t-shirt-full-sleeve/colors/black/back.jpg",
    },
    white: {
      front: "/products/custom-t-shirt-full-sleeve/colors/white/front.jpg",
      back: "/products/custom-t-shirt-full-sleeve/colors/white/back.jpg",
    },
    "navy-blue": {
      front: "/products/custom-t-shirt-full-sleeve/colors/navy-blue/front.jpg",
      back: "/products/custom-t-shirt-full-sleeve/colors/navy-blue/back.jpg",
    },
    "dark-green": {
      front: "/products/custom-t-shirt-full-sleeve/colors/dark-green/front.jpg",
      back: "/products/custom-t-shirt-full-sleeve/colors/dark-green/back.jpg",
    },
  },
  "fridge-magnets": {
    round: {
      front: "/products/fridge-magnets/shapes/round.jpg",
      back: "/products/fridge-magnets/shapes/round.jpg",
    },
    heart: {
      front: "/products/fridge-magnets/shapes/heart.jpg",
      back: "/products/fridge-magnets/shapes/heart.jpg",
    },
    rectangle: {
      front: "/products/fridge-magnets/shapes/rectangle.jpg",
      back: "/products/fridge-magnets/shapes/rectangle.jpg",
    },
    square: {
      front: "/products/fridge-magnets/shapes/square.jpg",
      back: "/products/fridge-magnets/shapes/square.jpg",
    },
  },
};

export function getProductMockupSideImages(
  slug?: string,
  colorValue?: string
): ProductMockupSideImages | undefined {
  if (!slug) return undefined;
  if (colorValue) {
    const byColor = PRODUCT_MOCKUP_SIDES_BY_SLUG_AND_COLOR[slug]?.[colorValue];
    if (byColor) return byColor;
  }
  return PRODUCT_MOCKUP_SIDES_BY_SLUG[slug];
}

/** DB mockup URLs override static slug files; variant still picks colour/shape when set. */
export function resolveProductMockupSides(
  product: {
    slug: string;
    mockupFrontImage?: { url?: string };
    mockupBackImage?: { url?: string };
  },
  variantValue?: string
): ProductMockupSideImages | undefined {
  const fromVariant = getProductMockupSideImages(product.slug, variantValue);
  const adminFront = product.mockupFrontImage?.url;
  if (adminFront) {
    const adminBack = product.mockupBackImage?.url || adminFront;
    if (variantValue && fromVariant) {
      return fromVariant;
    }
    return { front: adminFront, back: adminBack };
  }
  return fromVariant;
}

export function supportsDualSideCustomize(slug?: string): boolean {
  if (!slug) return true;
  return !isCalendarProduct(slug);
}

/** Back print zone until per-product back photos are added. */
export function getBackPrintArea(config: ProductMockupConfig): PrintAreaRect {
  if (config.backPrintArea) return config.backPrintArea;

  const { printArea } = config;
  return {
    x: Math.max(0, Math.min(100 - printArea.width, 100 - printArea.x - printArea.width)),
    y: printArea.y,
    width: printArea.width,
    height: printArea.height,
  };
}

/** Print-area presets tuned to each product blank photo. */
const PRODUCT_MOCKUP_BY_SLUG: Record<string, ProductMockupConfig> = {
  tumblers: {
    printArea: { x: 58, y: 27, width: 23, height: 48 },
    rounded: true,
    borderRadius: "10%",
  },
  "glass-tumblers": {
    printArea: { x: 58, y: 27, width: 23, height: 48 },
    rounded: true,
    borderRadius: "10%",
  },
  "sublimation-mug": {
    printArea: { x: 33, y: 24, width: 34, height: 46 },
    rounded: true,
    borderRadius: "6%",
  },
  keychains: {
    printArea: { x: 30, y: 28, width: 40, height: 44 },
    backPrintArea: { x: 30, y: 28, width: 40, height: 44 },
    rounded: false,
  },
  "sublimation-keychains": {
    printArea: { x: 32, y: 22, width: 36, height: 58 },
    backPrintArea: { x: 32, y: 22, width: 36, height: 58 },
    rounded: true,
    borderRadius: "8%",
  },
  "sublimation-pens": {
    printArea: { x: 45, y: 35, width: 18, height: 42 },
    rounded: true,
    borderRadius: "4%",
  },
  "sublimation-ornaments": {
    printArea: { x: 40, y: 35, width: 24, height: 30 },
    rounded: true,
    borderRadius: "50%",
  },
  "custom-t-shirt-half-sleeve": {
    printArea: { x: 34, y: 24, width: 32, height: 38 },
    backPrintArea: { x: 34, y: 22, width: 32, height: 40 },
    rounded: false,
  },
  "custom-t-shirt-full-sleeve": {
    printArea: { x: 34, y: 26, width: 32, height: 36 },
    backPrintArea: { x: 34, y: 24, width: 32, height: 38 },
    rounded: false,
  },
  "custom-hoodies": {
    printArea: { x: 32, y: 32, width: 36, height: 34 },
    backPrintArea: { x: 32, y: 28, width: 36, height: 38 },
    rounded: false,
  },
  "fridge-magnets": {
    printArea: { x: 18, y: 18, width: 64, height: 64 },
    backPrintArea: { x: 18, y: 18, width: 64, height: 64 },
    rounded: true,
    borderRadius: "12%",
  },
  caps: {
    printArea: { x: 28, y: 28, width: 44, height: 32 },
    backPrintArea: { x: 28, y: 30, width: 44, height: 30 },
    rounded: false,
  },
};

export function getProductMockupConfig(
  slug?: string,
  customizerPrintArea?: PrintAreaRect
): ProductMockupConfig {
  if (slug && PRODUCT_MOCKUP_BY_SLUG[slug]) {
    return PRODUCT_MOCKUP_BY_SLUG[slug];
  }

  return {
    printArea: customizerPrintArea || DEFAULT_PRINT_AREA,
    rounded: false,
  };
}
