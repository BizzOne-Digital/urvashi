"use client";

import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/admin/FormField";

export interface PrintLocationDraft {
  id: string;
  label: string;
  surcharge?: number;
}

interface ProductPrintLocationsEditorProps {
  value: PrintLocationDraft[];
  onChange: (value: PrintLocationDraft[]) => void;
  basePriceHint?: string;
}

export function ProductPrintLocationsEditor({
  value,
  onChange,
  basePriceHint = "Base product price is usually one-side print. Add a surcharge for front & back.",
}: ProductPrintLocationsEditorProps) {
  const addRow = () => {
    onChange([...value, { id: "", label: "", surcharge: 0 }]);
  };

  const updateRow = (index: number, patch: Partial<PrintLocationDraft>) => {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const hasBoth = value.some((row) => row.id.trim() === "front_and_back");
  const hasFront = value.some((row) => row.id.trim() === "front");
  const bothSurcharge = value.find((row) => row.id.trim() === "front_and_back")?.surcharge ?? 5;

  return (
    <div className="space-y-3">
      <p className="text-sm text-chrome-mid">{basePriceHint}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onChange([{ id: "front", label: "One side print", surcharge: 0 }])}
        >
          Front only
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            onChange([
              { id: "front", label: "One side print", surcharge: 0 },
              { id: "front_and_back", label: "Front & back print", surcharge: bothSurcharge },
            ])
          }
        >
          Front &amp; back option
        </Button>
        <Button type="button" variant="ghost" onClick={() => onChange([])}>
          Clear (standard print options)
        </Button>
      </div>
      {hasBoth && !hasFront ? (
        <p className="text-sm text-deep-magenta">
          Add a row with Print ID <code>front</code> so customers can still choose one-side print.
        </p>
      ) : null}
      <datalist id="print-location-ids">
        <option value="front" />
        <option value="front_and_back" />
      </datalist>
      {value.map((row, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_120px_auto]">
          <div>
            {i === 0 ? (
              <span className="mb-1 block text-sm font-medium">Print ID</span>
            ) : null}
            <input
              className={inputClass}
              placeholder="front"
              list="print-location-ids"
              value={row.id}
              onChange={(e) => updateRow(i, { id: e.target.value })}
            />
          </div>
          <div>
            {i === 0 ? (
              <span className="mb-1 block text-sm font-medium">Label (shown to customer)</span>
            ) : null}
            <input
              className={inputClass}
              placeholder="One side print"
              value={row.label}
              onChange={(e) => updateRow(i, { label: e.target.value })}
            />
          </div>
          <div>
            {i === 0 ? <span className="mb-1 block text-sm font-medium">Surcharge ($)</span> : null}
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={row.surcharge ?? 0}
              onChange={(e) =>
                updateRow(i, { surcharge: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div className={i === 0 ? "pt-6" : ""}>
            <Button type="button" variant="ghost" onClick={() => removeRow(i)}>
              Remove
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addRow}>
        Add print option
      </Button>
    </div>
  );
}
