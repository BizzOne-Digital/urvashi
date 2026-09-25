import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { generateRequestNumber } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import BookingRequest from "@/models/BookingRequest";
import CustomerArtwork from "@/models/CustomerArtwork";

const bookingSchema = z.object({
  customer: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().max(255),
    phone: z.string().max(30).optional(),
  }),
  requestType: z.string().min(1).max(100),
  preferredDate: z.string().optional(),
  preferredTimeWindow: z.string().max(100).optional(),
  timezone: z.string().max(100).optional(),
  flexibility: z.string().max(200).optional(),
  productInterest: z.string().max(200).optional(),
  approximateQuantity: z.coerce.number().int().positive().optional(),
  eventDate: z.string().optional(),
  message: z.string().max(5000).optional(),
  artworkAssetIds: z.array(z.string()).optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`booking:${ip}`, 5, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

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
        message: "Your consultation request has been received.",
      });
    }

    await connectDB();
    const settings = await getSettings();

    const booking = await BookingRequest.create({
      requestNumber: generateRequestNumber("BRK"),
      customer: {
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        email: data.customer.email.toLowerCase(),
        phone: data.customer.phone,
      },
      requestType: data.requestType,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : undefined,
      preferredTimeWindow: data.preferredTimeWindow,
      timezone: data.timezone,
      flexibility: data.flexibility,
      productInterest: data.productInterest,
      approximateQuantity: data.approximateQuantity,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      message: data.message,
      artworkAssetIds: data.artworkAssetIds || [],
      consentGiven: data.consentGiven,
      status: "new",
      statusHistory: [{ status: "new", note: "Request submitted", changedAt: new Date() }],
    });

    if (data.artworkAssetIds?.length) {
      await CustomerArtwork.updateMany(
        { _id: { $in: data.artworkAssetIds } },
        { bookingRequestId: booking._id }
      );
    }

    const notifyEmail =
      process.env.ORDER_NOTIFICATION_EMAIL || settings.contact.email;

    await sendEmail({
      to: notifyEmail,
      subject: `New booking request: ${booking.requestNumber}`,
      text: [
        `Request: ${booking.requestNumber}`,
        `Type: ${data.requestType}`,
        `Customer: ${data.customer.firstName} ${data.customer.lastName}`,
        `Email: ${data.customer.email}`,
        data.customer.phone ? `Phone: ${data.customer.phone}` : "",
        data.preferredDate ? `Preferred date: ${data.preferredDate}` : "",
        data.message ? `Message: ${data.message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    const confirmationCopy =
      settings.booking.confirmationCopy ||
      "Your consultation request has been received. We will contact you to confirm availability.";

    return NextResponse.json({
      success: true,
      message: confirmationCopy,
      requestNumber: booking.requestNumber,
      id: booking._id.toString(),
    });
  } catch (error) {
    console.error("Booking POST error:", error);
    return NextResponse.json({ error: "Failed to submit booking request" }, { status: 500 });
  }
}
