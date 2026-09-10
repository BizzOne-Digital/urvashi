import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateCustomizeTotals } from "@/lib/customize-totals";
import { getShippingRates, getOriginPostalCode, isCanadaPostApiEnabled } from "@/lib/canada-post";
import { getSettings } from "@/lib/settings";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { calculateParcelFromCart } from "@/lib/shipping-parcel";
import type { CalculatedLineItem } from "@/lib/pricing";

const schema = z.object({
  productSlug: z.string().min(1),
  quantity: z.coerce.number().int().positive().max(10000).optional(),
  preferDesign: z.boolean().optional(),
  postalCode: z.string().min(6).max(20),
  province: z.string().max(100).optional(),
  shippingMethod: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await connectDB();
    const settings = await getSettings();
    const product = await Product.findOne({ slug: parsed.data.productSlug, status: "published" });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const qty = parsed.data.quantity && parsed.data.quantity > 0 ? parsed.data.quantity : 1;
    const lineItem: CalculatedLineItem = {
      productId: product._id.toString(),
      productSlug: product.slug,
      productName: product.name,
      sku: product.sku,
      quantity: qty,
      unitPrice: product.price ?? 0,
      lineTotal: (product.price ?? 0) * qty,
      pricingMode: "fixed",
      customization: {},
      errors: [],
    };
    const parcel = calculateParcelFromCart([lineItem], new Map([[product._id.toString(), product]]));
    const origin = getOriginPostalCode(settings.commerce?.originPostalCode);

    const rates = await getShippingRates(origin, parsed.data.postalCode, parcel, {
      pickupEnabled: settings.commerce?.pickupEnabled ?? false,
      currency: product.currency || "CAD",
    });

    const selectedMethod = parsed.data.shippingMethod || rates[0]?.id;

    const totals = await calculateCustomizeTotals({
      productSlug: parsed.data.productSlug,
      quantity: parsed.data.quantity,
      preferDesign: parsed.data.preferDesign,
      shipping: {
        postalCode: parsed.data.postalCode,
        province: parsed.data.province,
        method: selectedMethod,
      },
    });

    return NextResponse.json({
      rates,
      selectedMethod,
      subtotal: totals.productSubtotal,
      designFee: totals.designFee,
      merchandiseTotal: totals.subtotal,
      shippingCost: totals.shippingCost,
      tax: totals.tax,
      taxLabel: totals.taxLabel,
      total: totals.total,
      currency: totals.currency,
      usingCanadaPostApi: isCanadaPostApiEnabled(),
    });
  } catch (error) {
    console.error("Customize shipping rates error:", error);
    return NextResponse.json({ error: "Failed to calculate shipping rates" }, { status: 500 });
  }
}
