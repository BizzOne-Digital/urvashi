import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  createCustomizeSubmission,
  startCustomizeCheckout,
} from "@/lib/customize-submission";
import { getPublicMonerisMode, isMonerisConfigured } from "@/lib/moneris";
import { MAX_ARTWORK_FILES } from "@/lib/artwork-upload";

const checkoutSchema = z
  .object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().max(255),
    phone: z.string().min(7).max(30),
    message: z.string().max(2000).optional(),
    artworkAssetId: z.string().min(1).optional(),
    artworkAssetIds: z.array(z.string().min(1)).min(1).max(MAX_ARTWORK_FILES).optional(),
    preferDesign: z.boolean().default(false),
    productSlug: z.string().max(120).optional(),
    productName: z.string().max(200).optional(),
    quantity: z.coerce.number().int().positive().max(10000).optional(),
    shipping: z
      .object({
        address1: z.string().min(1).max(200),
        city: z.string().min(1).max(100),
        province: z.string().min(1).max(100),
        postalCode: z.string().min(6).max(20),
        country: z.string().max(100).optional(),
        method: z.string().min(1).max(100),
      })
      .optional(),
    consentGiven: z.literal(true, {
      errorMap: () => ({ message: "Consent is required" }),
    }),
    website: z.string().optional(),
  })
  .refine((data) => (data.artworkAssetIds?.length || 0) > 0 || Boolean(data.artworkAssetId), {
    message: "At least one artwork upload is required",
    path: ["artworkAssetIds"],
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

    if (data.productSlug) {
      if (!data.shipping?.address1?.trim()) {
        return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
      }
      if (!data.shipping.postalCode?.trim() || data.shipping.postalCode.replace(/\s/g, "").length < 6) {
        return NextResponse.json({ error: "Valid postal code is required" }, { status: 400 });
      }
      if (!data.shipping.method) {
        return NextResponse.json({ error: "Please select a shipping method" }, { status: 400 });
      }
    }

    if (!isMonerisConfigured()) {
      return NextResponse.json(
        {
          error: "Online payment is not configured yet. Please contact us to complete your order.",
        },
        { status: 503 }
      );
    }

    const artworkAssetIds =
      data.artworkAssetIds?.length
        ? data.artworkAssetIds
        : data.artworkAssetId
          ? [data.artworkAssetId]
          : [];

    const { submission, totalDue } = await createCustomizeSubmission({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      message: data.message || "",
      artworkAssetIds,
      preferDesign: data.preferDesign,
      productSlug: data.productSlug,
      productName: data.productName,
      quantity: data.quantity,
      shipping: data.shipping,
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
