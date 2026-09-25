export interface VariantOptionStock {
  label: string;
  value: string;
  inStock?: boolean;
}

export interface VariantGroupStock {
  name: string;
  options: VariantOptionStock[];
}

/** Options available to customers (undefined inStock = in stock). */
export function filterInStockOptions<T extends { inStock?: boolean }>(options: T[]): T[] {
  return options.filter((opt) => opt.inStock !== false);
}

export function summarizeVariantStock(variants?: VariantGroupStock[]): string {
  if (!variants?.length) return "—";

  const parts: string[] = [];
  for (const group of variants) {
    for (const opt of group.options) {
      if (!opt.label?.trim()) continue;
      parts.push(opt.inStock === false ? `${opt.label} (out)` : opt.label);
    }
  }
  return parts.length ? parts.join(", ") : "—";
}

export function countInStockOptions(variants?: VariantGroupStock[]): {
  inStock: number;
  total: number;
} {
  let inStock = 0;
  let total = 0;
  for (const group of variants || []) {
    for (const opt of group.options) {
      if (!opt.label?.trim()) continue;
      total += 1;
      if (opt.inStock !== false) inStock += 1;
    }
  }
  return { inStock, total };
}
