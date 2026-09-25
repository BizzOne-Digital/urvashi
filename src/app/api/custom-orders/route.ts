import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { generateRequestNumber, formatCurrency } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import CustomOrderRequest from "@/models/CustomOrderRequest";
import CustomerArtwork from "@/models/CustomerArtwork";
import Product from "@/models/Product";
import { DESIGN_HELP_SURCHARGE } from "@/lib/product-catalog";

const customOrderSchema = z.object({
  customer: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().max(255),
    phone: z.string().max(30).optional(),
  }),
  productSlug: z.string().min(1).max(120),
  productName: z.string().min(1).max(200),
  quantity: z.coerce.number().int().positive().max(10000),
  instructions: z.string().max(5000).optional(),
  designHelp: z.boolean().default(false),
  artworkAssetIds: z.array(z.string()).min(1),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`custom-order:${ip}`, 8, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = customOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    if (data.website) {
      return NextResponse.json({
        success: true,
        message: "Your customization request has been received.",
      });
    }

    await connectDB();
    const settings = await getSettings();
    const product = await Product.findOne({ slug: data.productSlug, status: "published" }).lean();

    const unitPrice = product?.price ?? 0;
    const designFee = data.designHelp ? (product?.designHelpSurcharge ?? DESIGN_HELP_SURCHARGE) : 0;
    const estimatedTotal = unitPrice * data.quantity + designFee;

    const customOrder = await CustomOrderRequest.create({
      requestNumber: generateRequestNumber("COR"),
      customer: {
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        email: data.customer.email.toLowerCase(),
        phone: data.customer.phone,
      },
      productInterest: data.productName,
      productSlug: data.productSlug,
      quantity: data.quantity,
      instructions: data.instructions,
      designHelp: data.designHelp,
      estimatedTotal,
      quoteCurrency: product?.currency || "CAD",
      artworkAssetIds: data.artworkAssetIds,
      source: "customizer",
      status: "new",
      statusHistory: [{ status: "new", note: "Customization request submitted", changedAt: new Date() }],
    });

    if (data.artworkAssetIds.length) {
      await CustomerArtwork.updateMany(
        { _id: { $in: data.artworkAssetIds } },
        { customOrderId: customOrder._id }
      );
    }

    const notifyEmail = process.env.ORDER_NOTIFICATION_EMAIL || settings.contact.email;

    await sendEmail({
      to: notifyEmail,
      subject: `New customization request: ${customOrder.requestNumber}`,
      text: [
        `Request: ${customOrder.requestNumber}`,
        `Product: ${data.productName} (${data.productSlug})`,
        `Quantity: ${data.quantity}`,
        `Design help requested: ${data.designHelp ? "Yes" : "No"}`,
        `Estimated total: ${formatCurrency(estimatedTotal, product?.currency || "CAD")}`,
        `Customer: ${data.customer.firstName} ${data.customer.lastName}`,
        `Email: ${data.customer.email}`,
        data.customer.phone ? `Phone: ${data.customer.phone}` : "",
        data.instructions ? `Instructions: ${data.instructions}` : "",
        `Artwork IDs: ${data.artworkAssetIds.join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return NextResponse.json({
      success: true,
      message: "Your customization request has been sent. We will contact you shortly.",
      requestNumber: customOrder.requestNumber,
    });
  } catch (error) {
    console.error("Custom order POST error:", error);
    return NextResponse.json({ error: "Failed to submit customization request" }, { status: 500 });
  }
}
