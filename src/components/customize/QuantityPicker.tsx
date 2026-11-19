"use client";

import { cn } from "@/lib/utils";

const stepButton =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-white/15 bg-[#12141c] text-lg leading-none text-pure-paper transition-colors hover:border-cyan/50 disabled:cursor-not-allowed disabled:opacity-40";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  /** When set, the - / + buttons report +1 / -1 so the parent can update from its latest state. */
  onDelta?: (delta: number) => void;
  label: string;
  className?: string;
}

/** - / + buttons around a number input. */
export function QuantityStepper({
  value,
  min = 0,
  max = 10000,
  onChange,
  onDelta,
  label,
  className,
}: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const step = (delta: number) => (onDelta ? onDelta(delta) : onChange(clamp(value + delta)));

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        className={stepButton}
        onClick={() => step(-1)}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : min}
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10) || min))}
        aria-label={label}
        className="h-9 w-16 rounded-sm border border-white/15 bg-[#12141c] px-2 text-center text-sm text-pure-paper focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/25"
      />
      <button
        type="button"
        className={stepButton}
        onClick={() => step(1)}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}

interface QuantityPickerProps {
  value: number;
  min: number;
  onChange: (value: number) => void;
  /** e.g. "$19.99 each" shown next to the stepper */
  unitHint?: string;
}

/** Single quantity (tumblers, mugs, one-size products). */
export function QuantityPicker({ value, min, onChange, unitHint }: QuantityPickerProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-pure-paper">Quantity</label>
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={value} min={min} onChange={onChange} label="quantity" />
        {unitHint && <span className="text-xs text-chrome-mid">{unitHint}</span>}
      </div>
      <p className="mt-1 text-xs text-chrome-mid">
        Need more than one? Enter how many you want.
        {min > 1 ? ` Minimum order: ${min}.` : ""}
      </p>
    </div>
  );
}

export interface SizeOption {
  value: string;
  label: string;
}

interface SizeQuantityGridProps {
  sizes: SizeOption[];
  quantities: Record<string, number>;
  onChange: (update: (prev: Record<string, number>) => Record<string, number>) => void;
  minTotal: number;
  unitHint?: string;
}

/** Quantity per size, so one order can mix sizes (for example 2 Small and 3 Large). */
export function SizeQuantityGrid({
  sizes,
  quantities,
  onChange,
  minTotal,
  unitHint,
}: SizeQuantityGridProps) {
  const total = sizes.reduce((sum, s) => sum + (quantities[s.value] || 0), 0);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-pure-paper">Quantity by size</label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sizes.map((size) => (
          <div
            key={size.value}
            className={cn(
              "rounded-md border p-3",
              (quantities[size.value] || 0) > 0 ? "border-cyan/50 bg-cyan/5" : "border-white/10 bg-white/[0.02]"
            )}
          >
            <p className="mb-2 text-sm font-semibold text-pure-paper">{size.label}</p>
            <QuantityStepper
              value={quantities[size.value] || 0}
              min={0}
              onChange={(n) => onChange((prev) => ({ ...prev, [size.value]: Math.max(0, n) }))}
              onDelta={(d) =>
                onChange((prev) => ({ ...prev, [size.value]: Math.max(0, (prev[size.value] || 0) + d) }))
              }
              label={`${size.label} quantity`}
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-pure-paper">
        Total: <strong>{total}</strong> item{total === 1 ? "" : "s"}
        {unitHint ? <span className="ml-2 text-xs text-chrome-mid">{unitHint}</span> : null}
      </p>
      {total < minTotal && (
        <p className="mt-1 text-xs text-amber-200">
          {total === 0 ? "Choose at least one size." : `Minimum order is ${minTotal}.`}
        </p>
      )}
      <p className="mt-1 text-xs text-chrome-mid">
        Need a different design on some items? Add it as another design option and tell us how many of each in
        your instructions.
      </p>
    </div>
  );
}
