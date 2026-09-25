import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Product from "@/models/Product";
import { loadCalculatedCart } from "@/lib/cart";
import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getOriginPostalCode, getShippingRates, isCanadaPostApiEnabled } from "@/lib/canada-post";
import { formatCanadianPostalCode } from "@/lib/canadian-postal";
import { calculateParcelFromCart } from "@/lib/shipping-parcel";
import { calculateOrderTax } from "@/lib/order-totals";

const schema = z.object({
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

    const cart = await loadCalculatedCart();
    if (cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const fixedItems = cart.items.filter((i) => i.pricingMode === "fixed");
    if (fixedItems.length === 0) {
      return NextResponse.json({ error: "No shippable items in cart" }, { status: 400 });
    }

    await connectDB();
    const settings = await getSettings();
    const productIds = [...new Set(fixedItems.map((i) => i.productId))];
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const formattedPostal = formatCanadianPostalCode(parsed.data.postalCode);
    if (!formattedPostal) {
      return NextResponse.json(
        { error: "Enter a valid Canadian postal code (for example A1A 1A1)." },
        { status: 400 }
      );
    }

    const parcel = calculateParcelFromCart(fixedItems, productMap);
    const origin = getOriginPostalCode(settings.commerce?.originPostalCode);
    const pickupEnabled = settings.commerce?.pickupEnabled ?? false;

    const { rates, rateSource } = await getShippingRates(
      origin,
      formattedPostal,
      parcel,
      { pickupEnabled, currency: cart.currency }
    );

    const selectedMethod = parsed.data.shippingMethod || rates[0]?.id;
    const selectedRate = rates.find((r) => r.id === selectedMethod);
    const shippingCost = selectedRate?.price ?? 0;

    const { tax, taxLabel } = calculateOrderTax(
      cart.fixedSubtotal,
      shippingCost,
      settings,
      parsed.data.province,
      formattedPostal
    );

    const total = Math.round((cart.fixedSubtotal + shippingCost + tax) * 100) / 100;

    return NextResponse.json({
      rates,
      selectedMethod,
      subtotal: cart.fixedSubtotal,
      shippingCost,
      tax,
      taxLabel,
      total,
      currency: cart.currency,
      parcel: {
        weightKg: parcel.weightKg,
        dimensions: `${parcel.lengthCm}×${parcel.widthCm}×${parcel.heightCm} cm`,
      },
      usingCanadaPostApi: isCanadaPostApiEnabled(),
      rateSource,
      postalCode: formattedPostal,
    });
  } catch (error) {
    console.error("Shipping rates error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to calculate shipping rates";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
