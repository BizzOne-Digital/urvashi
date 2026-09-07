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
  monerisPreload,
  monerisReceipt,
} from "./moneris";
import CustomizeSubmission, { type ICustomizeSubmission } from "@/models/CustomizeSubmission";
import ContactMessage from "@/models/ContactMessage";
import CustomerArtwork from "@/models/CustomerArtwork";
import Product from "@/models/Product";

export const CUSTOMIZE_DESIGN_FEE = DESIGN_HELP_SURCHARGE;
export const CUSTOMIZE_BASE_FEE = 19;

export function getCustomizeBaseFee(): number {
  const fromEnv = process.env.CUSTOMIZE_BASE_FEE_CAD;
  if (fromEnv) {
    const parsed = parseFloat(fromEnv);
    if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
  }
  return CUSTOMIZE_BASE_FEE;
}

export function getCustomizeDesignFee(): number {
  const fromEnv = process.env.CUSTOMIZE_DESIGN_FEE_CAD;
  if (fromEnv) {
    const parsed = parseFloat(fromEnv);
    if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
  }
  return CUSTOMIZE_DESIGN_FEE;
}

export function getCustomizeCheckoutTotal(preferDesign: boolean, baseFee: number): number {
  const designFee = preferDesign ? getCustomizeDesignFee() : 0;
  return Math.round((baseFee + designFee) * 100) / 100;
}

export async function resolveCustomizeBaseFee(options: {
  productSlug?: string;
  quantity?: number;
}): Promise<{ baseFee: number; currency: string; productName?: string }> {
  if (!options.productSlug) {
    return { baseFee: getCustomizeBaseFee(), currency: "CAD" };
  }

  await connectDB();
  const product = await Product.findOne({ slug: options.productSlug, status: "published" }).lean();
  const quantity = options.quantity && options.quantity > 0 ? options.quantity : 1;
  const unitPrice = product?.price ?? getCustomizeBaseFee();
  const baseFee = Math.round(unitPrice * quantity * 100) / 100;

  return {
    baseFee,
    currency: product?.currency || "CAD",
    productName: product?.name,
  };
}

export async function finalizeCustomizeSubmission(
  submission: ICustomizeSubmission
): Promise<{ contactMessageId: string }> {
  await connectDB();
  const settings = await getSettings();

  const productLine = submission.productName
    ? `Product: ${submission.productName}${submission.quantity ? ` × ${submission.quantity}` : ""}`
    : undefined;

  const inquiryType = submission.preferDesign
    ? "Custom upload — design service (PAID)"
    : "Custom upload (PAID)";

  const paymentNote = [
    `Customer paid ${formatCurrency(submission.totalPaid, submission.currency)}.`,
    submission.baseFee > 0
      ? `Base customization fee: ${formatCurrency(submission.baseFee, submission.currency)}`
      : null,
    submission.preferDesign
      ? `Design service add-on: ${formatCurrency(submission.designFee, submission.currency)}`
      : null,
    productLine,
  ]
    .filter(Boolean)
    .join("\n");

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
      : "Paid customization upload — review artwork and contact customer about printing.",
  });

  await CustomerArtwork.updateOne(
    { _id: submission.artworkAssetId },
    { contactMessageId: contactMessage._id }
  );

  submission.contactMessageId = contactMessage._id;
  submission.status = submission.preferDesign ? "design_in_progress" : "new";
  submission.paymentStatus = "paid";
  await submission.save();

  const notifyEmail = process.env.ORDER_NOTIFICATION_EMAIL || settings.contact.email;
  const artwork = await getPrivateArtworkBuffer(submission.artworkAssetId);

  const subject = submission.preferDesign
    ? `PAID design request ${submission.referenceNumber} — ${submission.firstName} ${submission.lastName}`
    : `PAID custom upload ${submission.referenceNumber} — ${submission.firstName} ${submission.lastName}`;

  const textLines = [
    submission.preferDesign
      ? "PAID CUSTOMIZE REQUEST — CUSTOMER WANTS OUR DESIGN"
      : "PAID CUSTOMIZE REQUEST — CUSTOMER UPLOADED THEIR OWN DESIGN",
    "",
    `Reference: ${submission.referenceNumber}`,
    `Name: ${submission.firstName} ${submission.lastName}`,
    `Email: ${submission.email}`,
    `Phone: ${submission.phone}`,
    productLine || "",
    "",
    `Amount paid: ${formatCurrency(submission.totalPaid, submission.currency)}`,
    `Base fee: ${formatCurrency(submission.baseFee, submission.currency)}`,
    submission.preferDesign
      ? `Design service add-on: ${formatCurrency(submission.designFee, submission.currency)}`
      : "Design service requested: No",
    "",
    "Customer requirements:",
    submission.message,
    "",
    "The customer's uploaded image is attached to this email.",
    "",
    submission.preferDesign
      ? "Action: Review the image and requirements, then email the customer 2–3 design options."
      : "Action: Review the upload and contact the customer about printing their order.",
    "",
    `Artwork ID: ${submission.artworkAssetId}`,
    `Message ID: ${contactMessage._id.toString()}`,
  ].filter(Boolean);

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

  await sendEmail({
    to: submission.email,
    subject: `Payment confirmed — ${submission.referenceNumber}`,
    text: [
      `Hi ${submission.firstName},`,
      "",
      `Thank you! Your payment of ${formatCurrency(submission.totalPaid, submission.currency)} was received.`,
      `Reference: ${submission.referenceNumber}`,
      "",
      submission.preferDesign
        ? "We will review your upload and email you 2–3 design options shortly."
        : "We received your artwork and will contact you about printing your design.",
      "",
      "If you have any questions, feel free to contact us.",
    ].join("\n"),
    html: [
      `<p>Hi ${submission.firstName},</p>`,
      `<p>Thank you! Your payment of <strong>${formatCurrency(submission.totalPaid, submission.currency)}</strong> was received.</p>`,
      `<p>Reference: <strong>${submission.referenceNumber}</strong></p>`,
      `<p>${
        submission.preferDesign
          ? "We will review your upload and email you 2–3 design options shortly."
          : "We received your artwork and will contact you about printing your design."
      }</p>`,
      `<p>If you have any questions, feel free to contact us.</p>`,
    ].join(""),
  });

  return { contactMessageId: contactMessage._id.toString() };
}

export async function confirmCustomizePayment(ticket: string, referenceNumber: string) {
  await connectDB();

  if (!isMonerisConfigured()) {
    throw new Error("Payment verification unavailable");
  }

  const submission = await CustomizeSubmission.findOne({ referenceNumber });
  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.paymentStatus === "paid" && submission.contactMessageId) {
    return {
      success: true,
      alreadyProcessed: true,
      referenceNumber: submission.referenceNumber,
      message: submission.preferDesign
        ? "Your payment was already received. We will email your design options soon."
        : "Your payment was already received. We will contact you about your order soon.",
    };
  }

  const receipt = await monerisReceipt(ticket);
  if (!isMonerisReceiptApproved(receipt)) {
    throw new Error("Payment not completed");
  }

  const paidAmount = getMonerisReceiptAmount(receipt);
  const expectedTotal = getCustomizeCheckoutTotal(submission.preferDesign, submission.baseFee);
  if (paidAmount !== null && Math.abs(paidAmount - expectedTotal) > 0.02) {
    throw new Error("Payment amount does not match this request");
  }

  submission.totalPaid = paidAmount ?? expectedTotal;
  submission.monerisTicket = ticket;
  await finalizeCustomizeSubmission(submission);

  return {
    success: true,
    alreadyProcessed: false,
    referenceNumber: submission.referenceNumber,
    message: submission.preferDesign
      ? "Payment received! We will review your images and email you 2–3 design options shortly."
      : "Payment received! We received your artwork and will contact you about printing.",
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
  productSlug?: string;
  productName?: string;
  quantity?: number;
}) {
  await connectDB();

  const { baseFee, currency, productName } = await resolveCustomizeBaseFee({
    productSlug: data.productSlug,
    quantity: data.quantity,
  });
  const designFee = data.preferDesign ? getCustomizeDesignFee() : 0;
  const totalDue = getCustomizeCheckoutTotal(data.preferDesign, baseFee);

  const messageText =
    data.message.trim() ||
    (data.preferDesign
      ? "Customer paid for DPM design service and uploaded reference images."
      : "Customer paid and submitted artwork for custom printing.");

  const submission = await CustomizeSubmission.create({
    referenceNumber: generateRequestNumber("CSU"),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email.toLowerCase(),
    phone: data.phone,
    message: messageText,
    artworkAssetId: data.artworkAssetId,
    productSlug: data.productSlug,
    productName: data.productName || productName,
    quantity: data.quantity,
    preferDesign: data.preferDesign,
    baseFee,
    designFee,
    totalPaid: 0,
    currency,
    paymentStatus: "pending",
    status: "new",
  });

  return { submission, totalDue };
}

export async function startCustomizeCheckout(submission: ICustomizeSubmission, totalDue: number) {
  const ticket = await monerisPreload({
    txnTotal: totalDue,
    orderNo: submission.referenceNumber,
    contactDetails: {
      email: submission.email,
      firstName: submission.firstName,
      lastName: submission.lastName,
      phone: submission.phone,
    },
  });

  submission.monerisTicket = ticket;
  await submission.save();

  return ticket;
}
