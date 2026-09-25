import { z } from "zod";

export const customizePrintPlanSchema = z.enum([
  "blank",
  "print_front",
  "print_back",
  "print_front_and_back",
  "print_wrap",
]);

export type CustomizePrintPlanId = z.infer<typeof customizePrintPlanSchema>;

export interface CustomizePrintPlanOption {
  id: CustomizePrintPlanId;
  label: string;
  surcharge: number;
  description?: string;
}

export const CUSTOMIZE_PRINT_PLANS: CustomizePrintPlanOption[] = [
  { id: "blank", label: "Blank", surcharge: 0 },
  { id: "print_front", label: "Print Front", surcharge: 2.99 },
  { id: "print_back", label: "Print Back", surcharge: 2.99 },
  { id: "print_front_and_back", label: "Print Front and Back", surcharge: 5 },
  { id: "print_wrap", label: "Print from Front to Back", surcharge: 6 },
];

/** Shown in the print-option grid (no blank tile). */
export const CUSTOMIZE_PRINT_PLAN_OPTIONS = CUSTOMIZE_PRINT_PLANS.filter((p) => p.id !== "blank");

export function getPrintPlanOption(id: CustomizePrintPlanId): CustomizePrintPlanOption {
  return CUSTOMIZE_PRINT_PLANS.find((p) => p.id === id) || CUSTOMIZE_PRINT_PLANS[0];
}

export function getPrintPlanSurcharge(id: CustomizePrintPlanId, quantity = 1): number {
  const plan = getPrintPlanOption(id);
  return Math.round(plan.surcharge * quantity * 100) / 100;
}

export function printPlanRequiresFrontArtwork(id: CustomizePrintPlanId): boolean {
  return id === "print_front" || id === "print_front_and_back" || id === "print_wrap";
}

export function printPlanRequiresBackArtwork(id: CustomizePrintPlanId): boolean {
  return id === "print_back" || id === "print_front_and_back";
}

export function printPlanShowsFrontPreview(id: CustomizePrintPlanId): boolean {
  return id !== "print_back";
}

export function printPlanShowsBackPreview(id: CustomizePrintPlanId): boolean {
  return id !== "print_front" && id !== "blank";
}

export function formatPrintPlanOrderNote(id: CustomizePrintPlanId): string {
  const plan = getPrintPlanOption(id);
  const price =
    plan.surcharge > 0 ? ` (+${plan.surcharge.toFixed(2)} CAD per item)` : "";
  return `Print option: ${plan.label}${price}`;
}
