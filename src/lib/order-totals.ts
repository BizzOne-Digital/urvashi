import type { ISiteSettings } from "@/models/SiteSettings";
import {
  getOriginPostalCode,
  getShippingCostForMethod,
  getShippingRates,
  type ShippingMethodId,
  SHIPPING_METHODS,
} from "@/lib/canada-post";
import { calculateCanadianTax } from "@/lib/canadian-tax";
import { calculateParcelFromCart } from "@/lib/shipping-parcel";
import type { CalculatedLineItem } from "@/lib/pricing";
import type { IProduct } from "@/models/Product";

export interface OrderTotalsInput {
  subtotal: number;
  currency: string;
  items: CalculatedLineItem[];
  productMap: Map<string, IProduct>;
  settings: ISiteSettings;
  shipping?: {
    postalCode?: string;
    province?: string;
    method?: string;
  };
}

export interface OrderTotals {
  subtotal: number;
  shippingCost: number;
  tax: number;
  taxLabel?: string;
  total: number;
  currency: string;
  shippingMethod?: string;
  shippingMethodLabel?: string;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function calculateOrderTax(
  subtotal: number,
  shippingCost: number,
  settings: ISiteSettings,
  province?: string
): { tax: number; taxLabel?: string } {
  const mode = settings.commerce?.taxMode || "canadian";

  if (mode === "manual") {
    return { tax: 0 };
  }

  if (mode === "configured" && settings.commerce.taxRate) {
    const rate = settings.commerce.taxRate;
    const decimalRate = rate > 1 ? rate / 100 : rate;
    return {
      tax: round2((subtotal + shippingCost) * decimalRate),
      taxLabel: `Tax (${rate > 1 ? rate : rate * 100}%)`,
    };
  }

  const breakdown = calculateCanadianTax(subtotal, shippingCost, province);
  if (breakdown) {
    return { tax: breakdown.total, taxLabel: breakdown.label };
  }

  return { tax: 0 };
}

export async function calculateOrderTotals(input: OrderTotalsInput): Promise<OrderTotals> {
  const { subtotal, currency, items, productMap, settings, shipping } = input;
  const pickupEnabled = settings.commerce?.pickupEnabled ?? false;
  const methodId = shipping?.method as ShippingMethodId | undefined;

  let shippingCost = 0;
  let shippingMethodLabel: string | undefined;

  if (methodId === "pickup" && pickupEnabled) {
    shippingCost = 0;
    shippingMethodLabel = SHIPPING_METHODS.pickup.label;
  } else if (methodId && shipping?.postalCode) {
    const parcel = calculateParcelFromCart(items, productMap);
    const origin = getOriginPostalCode(settings.commerce?.originPostalCode);
    const quotes = await getShippingRates(origin, shipping.postalCode, parcel, {
      pickupEnabled,
      currency,
    });
    const cost = getShippingCostForMethod(methodId, quotes);
    if (cost == null) {
      throw new Error("Invalid shipping method for this address");
    }
    shippingCost = cost;
    const quote = quotes.find((q) => q.id === methodId);
    shippingMethodLabel = quote?.label;
  }

  const { tax, taxLabel } = calculateOrderTax(
    subtotal,
    shippingCost,
    settings,
    shipping?.province
  );

  return {
    subtotal,
    shippingCost,
    tax,
    taxLabel,
    total: round2(subtotal + shippingCost + tax),
    currency,
    shippingMethod: methodId,
    shippingMethodLabel,
  };
}
