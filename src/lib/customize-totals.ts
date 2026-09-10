import { connectDB } from "@/lib/db";
import Product, { type IProduct } from "@/models/Product";
import { getCustomizeDesignFee, resolveCustomizeBaseFee } from "@/lib/customize-submission";
import { calculateOrderTotals, type OrderTotals } from "@/lib/order-totals";
import type { CalculatedLineItem } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

export interface CustomizeTotalsInput {
  productSlug?: string;
  quantity?: number;
  preferDesign?: boolean;
  shipping?: {
    postalCode?: string;
    province?: string;
    method?: string;
  };
}

export interface CustomizeTotals extends OrderTotals {
  productSubtotal: number;
  designFee: number;
}

export async function calculateCustomizeTotals(
  input: CustomizeTotalsInput
): Promise<CustomizeTotals> {
  const { baseFee, currency } = await resolveCustomizeBaseFee({
    productSlug: input.productSlug,
    quantity: input.quantity,
  });
  const designFee = input.preferDesign ? getCustomizeDesignFee() : 0;
  const productSubtotal = baseFee;
  const subtotal = Math.round((productSubtotal + designFee) * 100) / 100;

  await connectDB();
  const settings = await getSettings();

  let items: CalculatedLineItem[] = [];
  const productMap = new Map<string, IProduct>();

  if (input.productSlug) {
    const product = await Product.findOne({ slug: input.productSlug, status: "published" });
    if (product) {
      const qty = input.quantity && input.quantity > 0 ? input.quantity : 1;
      const lineItem: CalculatedLineItem = {
        productId: product._id.toString(),
        productSlug: product.slug,
        productName: product.name,
        sku: product.sku,
        quantity: qty,
        unitPrice: product.price ?? baseFee / qty,
        lineTotal: productSubtotal,
        pricingMode: "fixed",
        customization: {},
        errors: [],
      };
      items = [lineItem];
      productMap.set(product._id.toString(), product);
    }
  }

  const totals = await calculateOrderTotals({
    subtotal,
    currency,
    items,
    productMap,
    settings,
    shipping: input.shipping,
  });

  return {
    ...totals,
    productSubtotal,
    designFee,
  };
}
