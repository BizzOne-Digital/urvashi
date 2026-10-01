import type { CustomizePrintPlanId } from "@/lib/customize-print-plan";

export interface ProductCustomizePrintRules {
  allowedPlans: CustomizePrintPlanId[];
  defaultPlan: CustomizePrintPlanId;
  planLabels?: Partial<Record<CustomizePrintPlanId, string>>;
  /** Print option is included in the listed product price (no extra surcharge). */
  priceIncludedInBase?: boolean;
}

const ACRYLIC_UV_KEYCHAIN_RULES: ProductCustomizePrintRules = {
  allowedPlans: ["print_front"],
  defaultPlan: "print_front",
  planLabels: { print_front: "One-sided UV print" },
  priceIncludedInBase: true,
};

const SUBLIMATION_KEYCHAIN_RULES: ProductCustomizePrintRules = {
  allowedPlans: ["print_front_and_back"],
  defaultPlan: "print_front_and_back",
  planLabels: { print_front_and_back: "Double-sided sublimation" },
  priceIncludedInBase: true,
};

const RULES_BY_SLUG: Record<string, ProductCustomizePrintRules> = {
  keychains: ACRYLIC_UV_KEYCHAIN_RULES,
  "key-chain": ACRYLIC_UV_KEYCHAIN_RULES,
  keychain: ACRYLIC_UV_KEYCHAIN_RULES,
  "sublimation-keychains": SUBLIMATION_KEYCHAIN_RULES,
};

function normalizeProductSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function getProductCustomizePrintRules(slug?: string): ProductCustomizePrintRules | undefined {
  if (!slug) return undefined;
  const key = normalizeProductSlug(slug);
  if (RULES_BY_SLUG[key]) return RULES_BY_SLUG[key];

  if (key.includes("sublimation") && key.includes("keychain")) {
    return SUBLIMATION_KEYCHAIN_RULES;
  }
  if (key.includes("keychain") || key.includes("key-chain")) {
    return ACRYLIC_UV_KEYCHAIN_RULES;
  }

  return undefined;
}

export function isPrintPlanAllowedForProduct(
  slug: string | undefined,
  plan: CustomizePrintPlanId
): boolean {
  const rules = getProductCustomizePrintRules(slug);
  if (!rules) return true;
  return rules.allowedPlans.includes(plan);
}

/** Keychains are flat tags — no cylindrical wrap. */
export function productSupportsWrapPrint(slug?: string): boolean {
  return getProductCustomizePrintRules(slug) == null;
}
