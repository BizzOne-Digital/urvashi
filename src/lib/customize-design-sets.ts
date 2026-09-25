import type { CustomizePrintPlanId } from "@/lib/customize-print-plan";
import { formatPrintPlanOrderNote } from "@/lib/customize-print-plan";

export const MAX_CUSTOMIZE_DESIGNS = 3;

export interface CustomizeDesignSetPayload {
  printPlan: CustomizePrintPlanId;
  frontArtworkAssetIds?: string[];
  backArtworkAssetIds?: string[];
  placementNotes?: string;
}

export function flattenDesignSetArtworkIds(sets: CustomizeDesignSetPayload[]): string[] {
  const ids: string[] = [];
  for (const set of sets) {
    for (const id of set.frontArtworkAssetIds || []) ids.push(id);
    for (const id of set.backArtworkAssetIds || []) ids.push(id);
  }
  return ids;
}

export function formatCustomizeDesignSetsMessage(sets: CustomizeDesignSetPayload[]): string {
  if (!sets.length) return "";

  return sets
    .map((set, index) => {
      const lines = [
        `--- Design ${index + 1} of ${sets.length} ---`,
        formatPrintPlanOrderNote(set.printPlan),
        set.placementNotes?.trim() || "",
        set.frontArtworkAssetIds?.length
          ? `Front artwork IDs: ${set.frontArtworkAssetIds.join(", ")}`
          : "",
        set.backArtworkAssetIds?.length
          ? `Back artwork IDs: ${set.backArtworkAssetIds.join(", ")}`
          : "",
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n\n");
}
