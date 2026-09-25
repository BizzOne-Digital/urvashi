"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { CalculatedLineItem } from "@/lib/pricing";

function getCartItemKey(
  item: Pick<CalculatedLineItem, "productId" | "variantSelections" | "printLocation">
): string {
  const variants = item.variantSelections ? JSON.stringify(item.variantSelections) : "";
  const loc = item.printLocation || "";
  return `${item.productId}:${variants}:${loc}`;
}

interface CartResponse {
  cart: {
    items: CalculatedLineItem[];
    fixedSubtotal: number;
    hasQuoteItems: boolean;
    currency: string;
    errors: string[];
  };
}

export function CartClient() {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartResponse["cart"] | null>(null);

  const loadCart = async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load cart");
      const data = (await res.json()) as CartResponse;
      setCart(data.cart);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (item: CalculatedLineItem, quantity: number) => {
    const key = getCartItemKey(item);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", key, quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to update cart");
      return;
    }
    setCart(data.cart);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const removeItem = async (item: CalculatedLineItem) => {
    const key = getCartItemKey(item);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", key }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to remove item");
      return;
    }
    setCart(data.cart);
    window.dispatchEvent(new Event("cart-updated"));
    toast.success("Item removed");
  };

  if (loading) {
    return <p className="text-chrome-mid">Loading cart…</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-chrome-light p-12 text-center">
        <p className="font-display text-xl font-semibold">Your cart is empty</p>
        <p className="mt-2 text-sm text-carbon">Browse our shop or start customizing a product.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href="/shop" className="btn-primary inline-flex">Shop products</Link>
          <Link href="/customize" className="btn-secondary inline-flex">Customize</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-10 lg:grid-cols-3">
      <div className="min-w-0 space-y-4 lg:col-span-2">
        {cart.items.map((item) => (
          <div key={getCartItemKey(item)} className="flex min-w-0 flex-col gap-4 rounded-sm border border-chrome-light/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link href={`/shop/${item.productSlug}`} className="break-words font-semibold hover:text-royal-blue">
                {item.productName}
              </Link>
              {item.customization?.text && (
                <p className="text-xs text-chrome-mid">Text: {item.customization.text}</p>
              )}
              {item.pricingMode === "quote" ? (
                <p className="text-sm text-deep-magenta">Contact for price</p>
              ) : (
                <p className="text-sm text-carbon">
                  {formatCurrency(item.unitPrice, cart.currency)} × {item.quantity}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item, parseInt(e.target.value, 10) || 1)}
                className="w-16 rounded-sm border border-chrome-light px-2 py-1 text-sm"
                aria-label={`Quantity for ${item.productName}`}
              />
              <Button variant="ghost" onClick={() => removeItem(item)} className="text-deep-magenta">
                Remove
              </Button>
            </div>
          </div>
        ))}
        {cart.errors.length > 0 && (
          <div className="rounded-sm border border-deep-magenta/40 bg-deep-magenta/5 p-4 text-sm text-deep-magenta">
            {cart.errors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
      </div>

      <div className="rounded-sm border border-chrome-light/60 bg-chrome-light/5 p-6 h-fit">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>
        <p className="mt-4 flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-semibold">{formatCurrency(cart.fixedSubtotal, cart.currency)}</span>
        </p>
        {cart.hasQuoteItems && (
          <p className="mt-2 text-xs text-deep-magenta">Quote items must be removed before checkout.</p>
        )}
        <Link
          href="/checkout"
          className={`btn-primary mt-6 flex w-full justify-center ${cart.hasQuoteItems ? "pointer-events-none opacity-50" : ""}`}
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
