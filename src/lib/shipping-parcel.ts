import type { IProduct } from "@/models/Product";
import type { CalculatedLineItem } from "@/lib/pricing";
import { FALLBACK_PARCEL, PRODUCT_SHIPPING_DEFAULTS } from "@/lib/shipping-defaults";

export interface ParcelSpec {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  totalWeightGrams: number;
}

function getItemSpec(product: IProduct | undefined, slug: string) {
  if (product?.weightGrams && product.lengthCm && product.widthCm && product.heightCm) {
    return {
      weightGrams: product.weightGrams,
      lengthCm: product.lengthCm,
      widthCm: product.widthCm,
      heightCm: product.heightCm,
    };
  }
  return PRODUCT_SHIPPING_DEFAULTS[slug] || FALLBACK_PARCEL;
}

/** Aggregate cart line items into a single parcel for Canada Post rating. */
export function calculateParcelFromCart(
  items: CalculatedLineItem[],
  productMap: Map<string, IProduct>
): ParcelSpec {
  let totalWeightGrams = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let stackedHeight = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    const spec = getItemSpec(product, item.productSlug);
    totalWeightGrams += spec.weightGrams * item.quantity;
    maxLength = Math.max(maxLength, spec.lengthCm);
    maxWidth = Math.max(maxWidth, spec.widthCm);
    stackedHeight += spec.heightCm * item.quantity;
  }

  if (totalWeightGrams === 0) {
    return {
      weightKg: FALLBACK_PARCEL.weightGrams / 1000,
      lengthCm: FALLBACK_PARCEL.lengthCm,
      widthCm: FALLBACK_PARCEL.widthCm,
      heightCm: FALLBACK_PARCEL.heightCm,
      totalWeightGrams: FALLBACK_PARCEL.weightGrams,
    };
  }

  const cappedHeight = Math.min(stackedHeight, 40);
  const weightKg = Math.max(totalWeightGrams / 1000, 0.1);

  return {
    weightKg: Math.round(weightKg * 1000) / 1000,
    lengthCm: Math.max(maxLength, 15),
    widthCm: Math.max(maxWidth, 10),
    heightCm: Math.max(cappedHeight, 5),
    totalWeightGrams,
  };
}
