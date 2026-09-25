"use client";

import {
  CUSTOMIZE_PRINT_PLAN_OPTIONS,
  type CustomizePrintPlanId,
  printPlanRequiresBackArtwork,
  printPlanRequiresFrontArtwork,
} from "@/lib/customize-print-plan";
import {
  ArtworkMultiUpload,
  type LocalArtworkFile,
} from "@/components/customize/ArtworkMultiUpload";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CustomizePrintPlanPanelProps {
  printPlan: CustomizePrintPlanId;
  onPrintPlanChange: (plan: CustomizePrintPlanId) => void;
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

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CUSTOMIZE_PRINT_PLAN_OPTIONS.map((plan) => {
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
              {plan.surcharge > 0 && (
                <span className="mt-1 block text-xs text-cyan">
                  +{formatCurrency(plan.surcharge, currency)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showUploads && (
        <div className="space-y-4 border-t border-white/10 pt-4">
          {needsFront && (
            <ArtworkMultiUpload
              items={frontArtworkItems}
              onChange={onFrontArtworkChange}
              rightsConfirmed={rightsConfirmed}
              customerNote={customerNote}
              label="From Front"
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
              label="To Back"
              hint="Upload artwork for the back."
              hidePreviews
              maxFiles={1}
            />
          )}
          {printPlan === "print_wrap" && (
            <p className="text-xs text-chrome-mid">
              Wrap printing uses your front artwork across the front and back preview. Our team aligns the
              seam on the final product.
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
