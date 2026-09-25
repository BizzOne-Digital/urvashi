import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { getPrivateArtworkBuffer } from "@/lib/media";
import { getSettings } from "@/lib/settings";
import ContactMessage from "@/models/ContactMessage";
import CustomerArtwork from "@/models/CustomerArtwork";

const customizeRequestSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(7).max(30),
  message: z.string().max(2000).optional(),
  artworkAssetId: z.string().min(1),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`customize-request:${ip}`, 8, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = customizeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    if (data.website) {
      return NextResponse.json({
        success: true,
        message: "Thank you! We received your request and will contact you soon.",
      });
    }

    await connectDB();
    const settings = await getSettings();

    const messageText =
      data.message?.trim() ||
      "Custom print request submitted from the customize page with uploaded artwork.";

    const contactMessage = await ContactMessage.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      inquiryType: "Custom upload",
      message: messageText,
      artworkAssetIds: [data.artworkAssetId],
      consentGiven: data.consentGiven,
      status: "new",
    });

    await CustomerArtwork.updateOne(
      { _id: data.artworkAssetId },
      { contactMessageId: contactMessage._id }
    );

    const notifyEmail = process.env.ORDER_NOTIFICATION_EMAIL || settings.contact.email;
    const artwork = await getPrivateArtworkBuffer(data.artworkAssetId);

    const textLines = [
      "New customize page submission",
      "",
      `Name: ${data.firstName} ${data.lastName}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      "",
      `Message: ${messageText}`,
      "",
      `Artwork ID: ${data.artworkAssetId}`,
      `Message ID: ${contactMessage._id.toString()}`,
    ];

    await sendEmail({
      to: notifyEmail,
      subject: `New custom print request from ${data.firstName} ${data.lastName}`,
      text: textLines.join("\n"),
      html: textLines.map((line) => (line ? `<p>${line}</p>` : "")).join(""),
      attachments: artwork
        ? [
            {
              filename: artwork.originalName,
              content: artwork.buffer,
              contentType: artwork.mimeType,
            },
          ]
        : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! We received your picture and details. We will contact you soon.",
      id: contactMessage._id.toString(),
    });
  } catch (error) {
    console.error("Customize request POST error:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
