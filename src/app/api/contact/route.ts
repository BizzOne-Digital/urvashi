import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import ContactMessage from "@/models/ContactMessage";
import CustomerArtwork from "@/models/CustomerArtwork";

const contactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional(),
  inquiryType: z.string().min(1).max(100),
  productInterest: z.string().max(200).optional(),
  serviceInterest: z.string().max(200).optional(),
  quantity: z.coerce.number().int().positive().optional(),
  deadline: z.string().optional(),
  message: z.string().min(10).max(5000),
  artworkAssetIds: z.array(z.string()).optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.website) {
      return NextResponse.json({
        success: true,
        message: "Thank you for your message. We will be in touch soon.",
      });
    }

    await connectDB();

    const message = await ContactMessage.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      inquiryType: data.inquiryType,
      productInterest: data.productInterest,
      serviceInterest: data.serviceInterest,
      quantity: data.quantity,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      message: data.message,
      artworkAssetIds: data.artworkAssetIds || [],
      consentGiven: data.consentGiven,
      status: "new",
    });

    if (data.artworkAssetIds?.length) {
      await CustomerArtwork.updateMany(
        { _id: { $in: data.artworkAssetIds } },
        { contactMessageId: message._id }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your message. We will be in touch soon.",
      id: message._id.toString(),
    });
  } catch (error) {
    console.error("Contact POST error:", error);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}
