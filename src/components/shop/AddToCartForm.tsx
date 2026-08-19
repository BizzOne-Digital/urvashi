"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getProductPriceDisplay } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface Variant {
  name: string;
  options: Array<{ label: string; value: string; surcharge?: number }>;
}

interface PrintLocation {
  id: string;
  label: string;
  surcharge?: number;
}

interface AddToCartProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  pricingMode: "fixed" | "quote";
  price?: number;
  currency?: string;
  minQuantity: number;
  quantityStep: number;
  stock?: number;
  variants?: Variant[];
  printLocations?: PrintLocation[];
  customizer?: { enabled?: boolean };
}

interface AddToCartFormProps {
  product: AddToCartProduct;
  className?: string;
}

export function AddToCartForm({ product, className }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(product.minQuantity || 1);
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});
  const [printLocation, setPrintLocation] = useState(product.printLocations?.[0]?.id || "");
  const [adding, setAdding] = useState(false);

  const { display, isQuote } = getProductPriceDisplay(product, product.currency);

  const handleAdd = async () => {
    if (isQuote) {
      window.location.href = "/contact";
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          item: {
            productId: product._id,
            productSlug: product.slug,
            productName: product.name,
            sku: product.sku,
            quantity,
            pricingMode: product.pricingMode,
            variantSelections: Object.keys(variantSelections).length ? variantSelections : undefined,
            printLocation: printLocation || undefined,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add to cart");
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const fieldClass = "rounded-sm border border-chrome-light bg-pure-paper px-3 py-2 text-sm";

  return (
    <div className={cn("space-y-5", className)}>
      <p className="text-2xl font-bold text-royal-blue">{display}</p>

      {product.variants?.map((variant) => (
        <div key={variant.name}>
          <label className="mb-1 block text-sm font-medium">{variant.name}</label>
          <select
            value={variantSelections[variant.name] || ""}
            onChange={(e) => setVariantSelections((s) => ({ ...s, [variant.name]: e.target.value }))}
            className={cn(fieldClass, "w-full")}
          >
            <option value="">Select {variant.name}</option>
            {variant.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}{opt.surcharge ? ` (+$${opt.surcharge})` : ""}
              </option>
            ))}
          </select>
        </div>
      ))}

      {product.printLocations && product.printLocations.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium">Print location</label>
          <select
            value={printLocation}
            onChange={(e) => setPrintLocation(e.target.value)}
            className={cn(fieldClass, "w-full")}
          >
            {product.printLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.label}{loc.surcharge ? ` (+$${loc.surcharge})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="quantity" className="mb-1 block text-sm font-medium">Quantity</label>
        <input
          id="quantity"
          type="number"
          min={product.minQuantity}
          step={product.quantityStep}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || product.minQuantity)}
          className={cn(fieldClass, "w-24")}
        />
        {product.minQuantity > 1 && (
          <p className="mt-1 text-xs text-chrome-mid">Minimum order: {product.minQuantity}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAdd} disabled={adding}>
          {isQuote ? "Contact for quote" : adding ? "Adding…" : "Add to cart"}
        </Button>
        {product.customizer?.enabled && (
          <Button variant="secondary" onClick={() => { window.location.href = `/customize?product=${product.slug}`; }}>
            Customize
          </Button>
        )}
      </div>
    </div>
  );
}
