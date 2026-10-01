"use client";

import { Button } from "@/components/ui/Button";
import { FormField, inputClass } from "@/components/admin/FormField";

export interface ProductVariantDraft {
  name: string;
  options: Array<{ label: string; value: string; surcharge?: number; inStock?: boolean }>;
}

interface ProductVariantsEditorProps {
  value: ProductVariantDraft[];
  onChange: (value: ProductVariantDraft[]) => void;
}

export function ProductVariantsEditor({ value, onChange }: ProductVariantsEditorProps) {
  const addVariant = () => {
    onChange([...value, { name: "Colour", options: [{ label: "", value: "", inStock: true }] }]);
  };

  const updateVariant = (index: number, patch: Partial<ProductVariantDraft>) => {
    onChange(value.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const removeVariant = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addOption = (variantIndex: number) => {
    const next = value.map((v, i) =>
      i === variantIndex
        ? { ...v, options: [...v.options, { label: "", value: "", inStock: true }] }
        : v
    );
    onChange(next);
  };

  const updateOption = (
    variantIndex: number,
    optionIndex: number,
    field: "label" | "value" | "surcharge" | "inStock",
    raw: string | boolean
  ) => {
    const next = value.map((v, i) => {
      if (i !== variantIndex) return v;
      const options = v.options.map((opt, j) => {
        if (j !== optionIndex) return opt;
        if (field === "inStock") {
          return { ...opt, inStock: Boolean(raw) };
        }
        if (field === "surcharge") {
          const num = typeof raw === "string" && raw !== "" ? parseFloat(raw) : undefined;
          return { ...opt, surcharge: Number.isFinite(num) ? num : undefined };
        }
        return { ...opt, [field]: raw };
      });
      return { ...v, options };
    });
    onChange(next);
  };

  const removeOption = (variantIndex: number, optionIndex: number) => {
    const next = value.map((v, i) =>
      i === variantIndex ? { ...v, options: v.options.filter((_, j) => j !== optionIndex) } : v
    );
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {value.length === 0 ? (
        <p className="text-sm text-chrome-mid">No variants (optional). Add Colour, Size, or Shape options.</p>
      ) : null}

      {value.map((variant, vi) => (
        <div key={vi} className="rounded-md border border-chrome-light/30 p-4">
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <FormField label="Variant name" className="min-w-[140px] flex-1">
              <input
                className={inputClass}
                value={variant.name}
                placeholder="Colour"
                onChange={(e) => updateVariant(vi, { name: e.target.value })}
              />
            </FormField>
            <Button type="button" variant="ghost" onClick={() => removeVariant(vi)}>
              Remove variant
            </Button>
          </div>

          <p className="mb-2 text-xs text-chrome-mid">
            Tick <strong>In stock</strong> for colours/shapes you have on hand. Untick to hide from the shop.
          </p>
          <div className="space-y-2">
            {variant.options.map((opt, oi) => (
              <div
                key={oi}
                className="grid gap-2 rounded border border-chrome-light/20 p-2 sm:grid-cols-[1fr_1fr_88px_100px_auto]"
              >
                <input
                  className={inputClass}
                  placeholder="Label (e.g. Navy blue)"
                  value={opt.label}
                  onChange={(e) => updateOption(vi, oi, "label", e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Value (e.g. navy-blue)"
                  value={opt.value}
                  onChange={(e) => updateOption(vi, oi, "value", e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  placeholder="+$"
                  value={opt.surcharge ?? ""}
                  onChange={(e) => updateOption(vi, oi, "surcharge", e.target.value)}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={opt.inStock !== false}
                    onChange={(e) => updateOption(vi, oi, "inStock", e.target.checked)}
                  />
                  In stock
                </label>
                <Button type="button" variant="ghost" onClick={() => removeOption(vi, oi)}>
                  ×
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" className="mt-3" onClick={() => addOption(vi)}>
            Add option
          </Button>
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={addVariant}>
        Add variant group
      </Button>
    </div>
  );
}
