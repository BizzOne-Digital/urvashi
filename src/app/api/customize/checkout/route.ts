import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  createCustomizeSubmission,
  startCustomizeCheckout,
} from "@/lib/customize-submission";
import { getPublicMonerisMode, isMonerisConfigured } from "@/lib/moneris";

const checkoutSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(7).max(30),
  message: z.string().max(2000).optional(),
  artworkAssetId: z.string().min(1),
  preferDesign: z.boolean().default(false),
  productSlug: z.string().max(120).optional(),
  productName: z.string().max(200).optional(),
  quantity: z.coerce.number().int().positive().max(10000).optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`customize-checkout:${ip}`, 8, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    if (data.website) {
      return NextResponse.json({ success: true, message: "Thank you! We received your request." });
    }

    if (data.preferDesign && !data.message?.trim()) {
      return NextResponse.json(
        { error: "Please describe what you want in your design before paying." },
        { status: 400 }
      );
    }

    if (!isMonerisConfigured()) {
      return NextResponse.json(
        {
          error: "Online payment is not configured yet. Please contact us to complete your order.",
        },
        { status: 503 }
      );
    }

    const { submission, totalDue } = await createCustomizeSubmission({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      message: data.message || "",
      artworkAssetId: data.artworkAssetId,
      preferDesign: data.preferDesign,
      productSlug: data.productSlug,
      productName: data.productName,
      quantity: data.quantity,
    });

    const ticket = await startCustomizeCheckout(submission, totalDue);

    return NextResponse.json({
      success: true,
      requiresPayment: true,
      monerisTicket: ticket,
      monerisMode: getPublicMonerisMode(),
      referenceNumber: submission.referenceNumber,
      baseFee: submission.baseFee,
      designFee: submission.designFee,
      amount: totalDue,
      currency: submission.currency,
    });
  } catch (error) {
    console.error("Customize checkout error:", error);
    const message = error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
