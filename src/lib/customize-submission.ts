import { connectDB } from "./db";
import { sendEmail } from "./email";
import { getPrivateArtworkBuffer } from "./media";
import { getSettings } from "./settings";
import { formatCurrency, generateRequestNumber } from "./utils";
import { DESIGN_HELP_SURCHARGE } from "./product-catalog";
import {
  getMonerisReceiptAmount,
  isMonerisConfigured,
  isMonerisReceiptApproved,
  monerisReceipt,
} from "./moneris";
import CustomizeSubmission, { type ICustomizeSubmission } from "@/models/CustomizeSubmission";
import ContactMessage from "@/models/ContactMessage";
import CustomerArtwork from "@/models/CustomerArtwork";

export const CUSTOMIZE_DESIGN_FEE = DESIGN_HELP_SURCHARGE;

export function getCustomizeDesignFee(): number {
  const fromEnv = process.env.CUSTOMIZE_DESIGN_FEE_CAD;
  if (fromEnv) {
    const parsed = parseFloat(fromEnv);
    if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
  }
  return CUSTOMIZE_DESIGN_FEE;
}

export async function finalizeCustomizeSubmission(
  submission: ICustomizeSubmission
): Promise<{ contactMessageId: string }> {
  await connectDB();
  const settings = await getSettings();

  const inquiryType = submission.preferDesign
    ? "Custom upload — design service (PAID)"
    : "Custom upload";

  const paymentNote = submission.preferDesign
    ? `Customer paid ${formatCurrency(submission.totalPaid, submission.currency)} for our design service.`
    : "Customer submitted artwork for review (no design service fee).";

  const contactMessage = await ContactMessage.create({
    firstName: submission.firstName,
    lastName: submission.lastName,
    email: submission.email.toLowerCase(),
    phone: submission.phone,
    inquiryType,
    message: `${submission.message}\n\n---\n${paymentNote}\nReference: ${submission.referenceNumber}`,
    artworkAssetIds: [submission.artworkAssetId],
    consentGiven: true,
    status: "new",
    adminNotes: submission.preferDesign
      ? "Paid design request — send 2–3 design options by email after reviewing uploads."
      : undefined,
  });

  await CustomerArtwork.updateOne(
    { _id: submission.artworkAssetId },
    { contactMessageId: contactMessage._id }
  );

  submission.contactMessageId = contactMessage._id;
  submission.status = submission.preferDesign ? "design_in_progress" : "new";
  if (submission.preferDesign) {
    submission.paymentStatus = "paid";
  }
  await submission.save();

  const notifyEmail = process.env.ORDER_NOTIFICATION_EMAIL || settings.contact.email;
  const artwork = await getPrivateArtworkBuffer(submission.artworkAssetId);

  const subject = submission.preferDesign
    ? `PAID design request ${submission.referenceNumber} — ${submission.firstName} ${submission.lastName}`
    : `Custom upload ${submission.referenceNumber} — ${submission.firstName} ${submission.lastName}`;

  const textLines = [
    submission.preferDesign
      ? "PAID CUSTOMIZE REQUEST — CUSTOMER WANTS OUR DESIGN"
      : "NEW CUSTOM UPLOAD REQUEST",
    "",
    `Reference: ${submission.referenceNumber}`,
    `Name: ${submission.firstName} ${submission.lastName}`,
    `Email: ${submission.email}`,
    `Phone: ${submission.phone}`,
    "",
    `Design service requested: ${submission.preferDesign ? "Yes (PAID)" : "No"}`,
    submission.preferDesign
      ? `Amount paid: ${formatCurrency(submission.totalPaid, submission.currency)}`
      : "No design fee charged.",
    "",
    `Customer notes: ${submission.message}`,
    "",
    submission.preferDesign
      ? "Action: Review uploaded images and email the customer 2–3 design options."
      : "Action: Review the upload and contact the customer about their order.",
    "",
    `Artwork ID: ${submission.artworkAssetId}`,
    `Message ID: ${contactMessage._id.toString()}`,
  ];

  await sendEmail({
    to: notifyEmail,
    subject,
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

  return { contactMessageId: contactMessage._id.toString() };
}

export async function confirmCustomizePayment(ticket: string, referenceNumber: string) {
  await connectDB();

  if (!isMonerisConfigured()) {
    throw new Error("Payment verification unavailable");
  }

  const submission = await CustomizeSubmission.findOne({ referenceNumber, preferDesign: true });
  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.paymentStatus === "paid" && submission.contactMessageId) {
    return {
      success: true,
      alreadyProcessed: true,
      referenceNumber: submission.referenceNumber,
      message: "Your payment was already received. We will email your design options soon.",
    };
  }

  const receipt = await monerisReceipt(ticket);
  if (!isMonerisReceiptApproved(receipt)) {
    throw new Error("Payment not completed");
  }

  submission.totalPaid = getMonerisReceiptAmount(receipt) ?? submission.designFee;
  submission.monerisTicket = ticket;
  await finalizeCustomizeSubmission(submission);

  return {
    success: true,
    alreadyProcessed: false,
    referenceNumber: submission.referenceNumber,
    message:
      "Payment received! We will review your images and email you 2–3 design options shortly.",
  };
}

export async function createCustomizeSubmission(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  artworkAssetId: string;
  preferDesign: boolean;
}) {
  await connectDB();

  const designFee = data.preferDesign ? getCustomizeDesignFee() : 0;
  const messageText =
    data.message.trim() ||
    (data.preferDesign
      ? "Customer paid for DPM design service and uploaded reference images."
      : "Custom print request submitted with uploaded artwork.");

  const submission = await CustomizeSubmission.create({
    referenceNumber: generateRequestNumber("CSU"),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email.toLowerCase(),
    phone: data.phone,
    message: messageText,
    artworkAssetId: data.artworkAssetId,
    preferDesign: data.preferDesign,
    designFee,
    totalPaid: data.preferDesign ? designFee : 0,
    currency: "CAD",
    paymentStatus: data.preferDesign ? "pending" : "not_required",
    status: "new",
  });

  return submission;
}
