import { describe, expect, it } from "vitest";
import { getPrintPlanSurcharge } from "@/lib/customize-print-plan";

describe("print plan surcharges", () => {
  it("charges more for a full front-to-back wrap than for separate front and back prints", () => {
    expect(getPrintPlanSurcharge("print_wrap", 1)).toBeGreaterThan(
      getPrintPlanSurcharge("print_front_and_back", 1)
    );
  });

  it("charges more for front and back than for a single side", () => {
    expect(getPrintPlanSurcharge("print_front_and_back", 1)).toBeGreaterThan(
      getPrintPlanSurcharge("print_front", 1)
    );
  });

  it("multiplies the surcharge by quantity", () => {
    expect(getPrintPlanSurcharge("print_wrap", 5)).toBe(40);
  });
});
