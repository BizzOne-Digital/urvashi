"use client";

import {
  type CustomizePrintPlanId,
  printPlanRequiresBackArtwork,
  printPlanRequiresFrontArtwork,
} from "@/lib/customize-print-plan";
import type { ProductPrintPlanChoice } from "@/lib/product-print-pricing";
import {
  ArtworkMultiUpload,
  type LocalArtworkFile,
} from "@/components/customize/ArtworkMultiUpload";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Tells the customer how many pictures each print option needs. */
const PLAN_HINTS: Record<CustomizePrintPlanId, string> = {
  blank: "",
  print_front: "1 picture on the front",
  print_back: "1 picture on the back",
  print_front_and_back: "2 pictures: one for the front, one for the back",
  print_wrap: "1 picture wrapped from front to back",
};

interface CustomizePrintPlanPanelProps {
  printPlan: CustomizePrintPlanId;
  onPrintPlanChange: (plan: CustomizePrintPlanId) => void;
  planChoices: ProductPrintPlanChoice[];
  currency?: string;
  frontArtworkItems: LocalArtworkFile[];
  backArtworkItems: LocalArtworkFile[];
  onFrontArtworkChange: (items: LocalArtworkFile[]) => void;
  onBackArtworkChange: (items: LocalArtworkFile[]) => void;
  rightsConfirmed: boolean;
  customerNote?: string;
  className?: string;
}

export function CustomizePrintPlanPanel({
  printPlan,
  onPrintPlanChange,
  planChoices,
  currency = "CAD",
  frontArtworkItems,
  backArtworkItems,
  onFrontArtworkChange,
  onBackArtworkChange,
  rightsConfirmed,
  customerNote,
  className,
}: CustomizePrintPlanPanelProps) {
  const needsFront = printPlanRequiresFrontArtwork(printPlan);
  const needsBack = printPlanRequiresBackArtwork(printPlan);
  const showUploads = printPlan !== "blank";

  const singlePlan = planChoices.length === 1;

  return (
    <div className={cn("space-y-6", className)}>
      {singlePlan ? (
        <div className="rounded-md border border-cyan/40 bg-cyan/10 px-4 py-3">
          <p className="text-sm font-semibold text-pure-paper">{planChoices[0].label}</p>
          <p className="mt-1 text-xs text-cyan">{formatCurrency(planChoices[0].unitTotal, currency)} each</p>
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {planChoices.map((plan) => {
          const selected = printPlan === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onPrintPlanChange(plan.id)}
              className={cn(
                "rounded-md border px-3 py-3 text-left text-sm transition-colors",
                selected
                  ? "border-cyan bg-cyan/10 text-pure-paper ring-1 ring-cyan/50"
                  : "border-white/15 bg-white/[0.03] text-chrome-light hover:border-cyan/40"
              )}
            >
              <span className="block font-semibold text-pure-paper">{plan.label}</span>
              <span className="mt-1 block text-xs text-cyan">
                {formatCurrency(plan.unitTotal, currency)} each
              </span>
              {PLAN_HINTS[plan.id] && (
                <span className="mt-1 block text-[11px] text-chrome-mid">{PLAN_HINTS[plan.id]}</span>
              )}
            </button>
          );
        })}
      </div>
      )}

      {showUploads && (
        <div className="space-y-4 border-t border-white/10 pt-4">
          {needsFront && (
            <ArtworkMultiUpload
              items={frontArtworkItems}
              onChange={onFrontArtworkChange}
              rightsConfirmed={rightsConfirmed}
              customerNote={customerNote}
              label={printPlan === "print_front_and_back" ? "Front picture" : "From Front"}
              hint="Upload artwork for the front."
              hidePreviews
              maxFiles={1}
            />
          )}
          {needsBack && (
            <ArtworkMultiUpload
              items={backArtworkItems}
              onChange={onBackArtworkChange}
              rightsConfirmed={rightsConfirmed}
              customerNote={customerNote}
              label={printPlan === "print_front_and_back" ? "Back picture" : "To Back"}
              hint="Upload artwork for the back."
              hidePreviews
              maxFiles={1}
            />
          )}
          {printPlan === "print_wrap" && (
            <p className="text-xs text-chrome-mid">
              Wrap printing uses your front artwork across the front and back preview. Our team aligns the
              seam on the final product. Want a different picture on the back? Choose{" "}
              <button
                type="button"
                className="underline hover:text-pure-paper"
                onClick={() => onPrintPlanChange("print_front_and_back")}
              >
                Print Front and Back
              </button>{" "}
              above to upload two pictures.
            </p>
          )}
        </div>
      )}

      <div className="border-t border-white/10 pt-4">
        <p className="text-sm font-semibold text-pure-paper">
          Choose your print method: Sublimation{" "}
          <span className="font-normal text-chrome-mid">(included for most products)</span>
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-md border border-cyan/40 bg-cyan/10 px-3 py-2 text-center text-xs font-medium text-pure-paper">
            Sublimation printing
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-center text-xs text-chrome-mid">
            UV / other — note in instructions
          </div>
        </div>
      </div>
    </div>
  );
}
