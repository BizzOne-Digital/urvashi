import {
  CUSTOMIZE_PRINT_PLAN_OPTIONS,
  type CustomizePrintPlanId,
  getPrintPlanSurcharge,
} from "@/lib/customize-print-plan";
import { formatCurrency } from "@/lib/utils";

export interface ProductPrintLocation {
  id: string;
  label: string;
  surcharge?: number;
}

export interface ProductPrintPlanChoice {
  id: CustomizePrintPlanId;
  label: string;
  /** Added to unit base price (per item) */
  surcharge: number;
  /** Total per item for display */
  unitTotal: number;
}

export function hasApparelStylePrintPricing(
  printLocations?: ProductPrintLocation[]
): boolean {
  return Boolean(printLocations?.some((loc) => loc.id === "front_and_back"));
}

export function getBothSidesUnitPrice(
  unitPrice: number,
  printLocations?: ProductPrintLocation[]
): number | undefined {
  const both = printLocations?.find((loc) => loc.id === "front_and_back");
  if (both == null || unitPrice == null) return undefined;
  return Math.round((unitPrice + (both.surcharge ?? 0)) * 100) / 100;
}

/** Shop / pricing page copy for one-side vs front & back. */
export function formatApparelPriceDisplay(
  unitPrice: number,
  currency = "CAD",
  printLocations?: ProductPrintLocation[]
): string | undefined {
  if (!hasApparelStylePrintPricing(printLocations)) return undefined;
  const bothPrice = getBothSidesUnitPrice(unitPrice, printLocations);
  if (bothPrice == null) return undefined;
  return `${formatCurrency(unitPrice, currency)} one-side · ${formatCurrency(bothPrice, currency)} front & back`;
}

export function getProductPrintPlanChoices(
  unitPrice: number,
  printLocations?: ProductPrintLocation[]
): ProductPrintPlanChoice[] {
  if (!hasApparelStylePrintPricing(printLocations)) {
    return CUSTOMIZE_PRINT_PLAN_OPTIONS.map((plan) => ({
      id: plan.id,
      label: plan.label,
      surcharge: plan.surcharge,
      unitTotal: Math.round((unitPrice + plan.surcharge) * 100) / 100,
    }));
  }

  const both = printLocations!.find((loc) => loc.id === "front_and_back");
  const bothSurcharge = both?.surcharge ?? 0;
  const oneSide = printLocations!.find((loc) => loc.id === "front");

  return [
    {
      id: "print_front",
      label: oneSide?.label || "One side print",
      surcharge: 0,
      unitTotal: unitPrice,
    },
    {
      id: "print_front_and_back",
      label: both?.label || "Front & back print",
      surcharge: bothSurcharge,
      unitTotal: Math.round((unitPrice + bothSurcharge) * 100) / 100,
    },
  ];
}

export function getProductPrintPlanSurcharge(
  printPlan: CustomizePrintPlanId,
  printLocations?: ProductPrintLocation[],
  quantity = 1
): number {
  if (!hasApparelStylePrintPricing(printLocations)) {
    return getPrintPlanSurcharge(printPlan, quantity);
  }

  if (printPlan === "print_front") return 0;
  if (printPlan === "print_front_and_back" || printPlan === "print_wrap") {
    const both = printLocations!.find((loc) => loc.id === "front_and_back");
    const perItem = both?.surcharge ?? 0;
    return Math.round(perItem * quantity * 100) / 100;
  }
  if (printPlan === "print_back") {
    const both = printLocations!.find((loc) => loc.id === "front_and_back");
    const perItem = both?.surcharge ?? 0;
    return Math.round(perItem * quantity * 100) / 100;
  }
  return 0;
}

export function defaultPrintPlanForProduct(
  printLocations?: ProductPrintLocation[]
): CustomizePrintPlanId {
  if (hasApparelStylePrintPricing(printLocations)) return "print_front";
  return "print_wrap";
}
