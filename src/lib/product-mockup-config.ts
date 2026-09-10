import { DEFAULT_PRINT_AREA, type PrintAreaRect } from "@/lib/mockup-preview";

export interface ProductMockupConfig {
  printArea: PrintAreaRect;
  /** Tighter corners for cylindrical drinkware, etc. */
  rounded?: boolean;
  borderRadius?: string;
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
    printArea: { x: 42, y: 38, width: 22, height: 28 },
    rounded: true,
    borderRadius: "6%",
  },
  "sublimation-keychains": {
    printArea: { x: 42, y: 38, width: 22, height: 28 },
    rounded: true,
    borderRadius: "6%",
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
