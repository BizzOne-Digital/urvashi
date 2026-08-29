import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "@/lib/db";
import { loadCalculatedCart, mutateCart } from "@/lib/cart";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { generateOrderNumber } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { sendEmail } from "@/lib/email";
import { createStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { calculateOrderTotals } from "@/lib/order-totals";
import Order from "@/models/Order";
import CustomerArtwork from "@/models/CustomerArtwork";
import Product from "@/models/Product";

const checkoutSchema = z.object({
  customer: z.object({
    email: z.string().email().max(255),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    phone: z.string().max(30).optional(),
  }),
  shipping: z
    .object({
      address1: z.string().max(200).optional(),
      address2: z.string().max(200).optional(),
      city: z.string().max(100).optional(),
      province: z.string().max(100).optional(),
      postalCode: z.string().max(20).optional(),
      country: z.string().max(100).optional(),
      method: z.string().max(100).optional(),
      notes: z.string().max(1000).optional(),
    })
    .optional(),
  billing: z
    .object({
      address1: z.string().max(200).optional(),
      address2: z.string().max(200).optional(),
      city: z.string().max(100).optional(),
      province: z.string().max(100).optional(),
      postalCode: z.string().max(20).optional(),
      country: z.string().max(100).optional(),
    })
    .optional(),
  customerNotes: z.string().max(2000).optional(),
  paymentMethod: z.enum(["manual_invoice", "stripe"]).default("manual_invoice"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`checkout:${ip}`, 10, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const cart = await loadCalculatedCart();

    if (cart.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    if (cart.errors.length > 0) {
      return NextResponse.json(
        { error: "Cart has validation errors", details: cart.errors },
        { status: 400 }
      );
    }

    const fixedItems = cart.items.filter((i) => i.pricingMode === "fixed");
    if (fixedItems.length === 0) {
      return NextResponse.json(
        {
          error:
            "No fixed-price items in cart. Quote-only items require a custom order request.",
        },
        { status: 400 }
      );
    }

    if (cart.hasQuoteItems) {
      return NextResponse.json(
        {
          error:
            "Cart contains quote-only items. Please remove them or submit a custom order request.",
        },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const shippingMethod = data.shipping?.method;
    const isPickup = shippingMethod === "pickup";

    if (!isPickup) {
      if (!data.shipping?.address1?.trim()) {
        return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
      }
      if (!data.shipping?.postalCode?.trim() || data.shipping.postalCode.replace(/\s/g, "").length < 6) {
        return NextResponse.json({ error: "Valid postal code is required" }, { status: 400 });
      }
      if (!data.shipping?.province?.trim()) {
        return NextResponse.json({ error: "Province is required for tax calculation" }, { status: 400 });
      }
      if (!shippingMethod) {
        return NextResponse.json({ error: "Please select a shipping method" }, { status: 400 });
      }
    }

    await connectDB();

    const productIds = [...new Set(fixedItems.map((i) => i.productId))];
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const totals = await calculateOrderTotals({
      subtotal: cart.fixedSubtotal,
      currency: cart.currency,
      items: fixedItems,
      productMap,
      settings,
      shipping: {
        postalCode: data.shipping?.postalCode,
        province: data.shipping?.province,
        method: shippingMethod,
      },
    });

    const { subtotal, tax, shippingCost, total } = totals;
    const orderNumber = generateOrderNumber();
    const accessToken = uuidv4();

    const shippingRecord = data.shipping
      ? {
          ...data.shipping,
          method: totals.shippingMethodLabel || data.shipping.method,
        }
      : undefined;

    const orderItems = fixedItems.map((item) => ({
      productId: item.productId,
      productSlug: item.productSlug,
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      pricingMode: item.pricingMode as "fixed",
      customization: {
        ...item.customization,
        printLocation: item.printLocation,
        variantSelections: item.variantSelections,
      },
    }));

    const order = await Order.create({
      orderNumber,
      customer: {
        email: data.customer.email.toLowerCase(),
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        phone: data.customer.phone,
      },
      shipping: shippingRecord,
      billing: data.billing,
      items: orderItems,
      subtotal,
      tax,
      shippingCost,
      discount: 0,
      total,
      currency: cart.currency,
      paymentStatus: "awaiting_payment",
      productionStatus: "inquiry",
      fulfillmentStatus: "pending",
      statusHistory: [
        {
          status: "inquiry",
          note: "Order placed",
          changedAt: new Date(),
        },
      ],
      paymentMethod:
        data.paymentMethod === "stripe" && isStripeConfigured()
          ? "stripe"
          : "manual_invoice",
      customerNotes: data.customerNotes,
      accessToken,
    });

    const artworkIds = fixedItems
      .map((i) => i.customization?.artworkAssetId)
      .filter((id): id is string => !!id);

    if (artworkIds.length > 0) {
      await CustomerArtwork.updateMany(
        { _id: { $in: artworkIds } },
        { orderId: order._id }
      );
    }

    await mutateCart("clear");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const orderUrl = `${siteUrl}/order/${orderNumber}?token=${accessToken}`;

    const notifyEmail =
      process.env.ORDER_NOTIFICATION_EMAIL || settings.contact.email;

    const confirmationCopy =
      settings.commerce?.orderConfirmationCopy ||
      "Your order total includes shipping and applicable taxes. We will contact you with payment instructions shortly.";

    await sendEmail({
      to: notifyEmail,
      subject: `New order: ${orderNumber}`,
      text: [
        `Order: ${orderNumber}`,
        `Customer: ${data.customer.firstName} ${data.customer.lastName}`,
        `Email: ${data.customer.email}`,
        `Subtotal: ${subtotal} ${cart.currency}`,
        `Shipping: ${shippingCost} ${cart.currency}`,
        `Tax: ${tax} ${cart.currency}`,
        `Total: ${total} ${cart.currency}`,
        `Payment: ${order.paymentMethod}`,
        `View: ${orderUrl}`,
      ].join("\n"),
    });

    await sendEmail({
      to: data.customer.email,
      subject: `Order confirmation: ${orderNumber}`,
      text: [
        `Thank you for your order, ${data.customer.firstName}!`,
        `Order number: ${orderNumber}`,
        `Subtotal: ${subtotal} ${cart.currency}`,
        `Shipping: ${shippingCost} ${cart.currency}`,
        `Tax: ${tax} ${cart.currency}`,
        `Total: ${total} ${cart.currency}`,
        confirmationCopy,
        `Track your order: ${orderUrl}`,
      ].join("\n\n"),
    });

    let stripeUrl: string | undefined;

    if (data.paymentMethod === "stripe" && isStripeConfigured()) {
      const session = await createStripeCheckoutSession({
        lineItems: fixedItems.map((item) => ({
          name: item.productName,
          amount: item.unitPrice,
          quantity: item.quantity,
        })),
        orderNumber,
        customerEmail: data.customer.email,
        successUrl: `${orderUrl}&paid=1`,
        cancelUrl: `${siteUrl}/cart`,
      });

      if (session) {
        order.stripeSessionId = session.sessionId;
        await order.save();
        stripeUrl = session.url;
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      accessToken,
      orderUrl,
      paymentMethod: order.paymentMethod,
      stripeUrl,
      subtotal,
      shippingCost,
      tax,
      total,
      currency: cart.currency,
    });
  } catch (error) {
    console.error("Checkout POST error:", error);
    const message =
      error instanceof Error && error.message.includes("shipping")
        ? error.message
        : "Failed to process checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
