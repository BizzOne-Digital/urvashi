import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  getMonerisReceiptAmount,
  isMonerisConfigured,
  isMonerisReceiptApproved,
  monerisReceipt,
} from "@/lib/moneris";
import { getSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/utils";
import Order from "@/models/Order";

const schema = z.object({
  ticket: z.string().min(1),
  orderNumber: z.string().min(1),
  accessToken: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    if (!isMonerisConfigured()) {
      return NextResponse.json({ error: "Payment verification unavailable" }, { status: 503 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { ticket, orderNumber, accessToken } = parsed.data;

    await connectDB();
    const order = await Order.findOne({ orderNumber, accessToken });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        orderNumber: order.orderNumber,
        accessToken: order.accessToken,
      });
    }

    const receipt = await monerisReceipt(ticket);
    if (!isMonerisReceiptApproved(receipt)) {
      return NextResponse.json({ error: "Payment was not approved" }, { status: 400 });
    }

    const paidAmount = getMonerisReceiptAmount(receipt);
    if (paidAmount !== null && Math.abs(paidAmount - order.total) > 0.02) {
      return NextResponse.json({ error: "Payment amount does not match order total" }, { status: 400 });
    }

    order.paymentStatus = "paid";
    order.paymentMethod = "moneris";
    order.monerisTicket = ticket;
    order.statusHistory.push({
      status: order.productionStatus,
      note: "Moneris payment received",
      changedAt: new Date(),
    });
    await order.save();

    const settings = await getSettings();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const orderUrl = `${siteUrl}/order/success?orderNumber=${order.orderNumber}&token=${order.accessToken}`;
    const notifyEmail = process.env.ORDER_NOTIFICATION_EMAIL || settings.contact.email;

    const confirmationCopy =
      settings.commerce?.orderConfirmationCopy ||
      "Thank you for your order. We will begin processing it shortly.";

    await sendEmail({
      to: notifyEmail,
      subject: `PAID order: ${order.orderNumber}`,
      text: [
        `Order: ${order.orderNumber}`,
        `Customer: ${order.customer.firstName} ${order.customer.lastName}`,
        `Email: ${order.customer.email}`,
        `Total paid: ${formatCurrency(order.total, order.currency)}`,
        `Payment: Moneris`,
        `View: ${orderUrl}`,
      ].join("\n"),
    });

    await sendEmail({
      to: order.customer.email,
      subject: `Payment confirmed: ${order.orderNumber}`,
      text: [
        `Thank you for your payment, ${order.customer.firstName}!`,
        `Order number: ${order.orderNumber}`,
        `Total paid: ${formatCurrency(order.total, order.currency)}`,
        confirmationCopy,
        `View your order: ${orderUrl}`,
      ].join("\n\n"),
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      accessToken: order.accessToken,
    });
  } catch (error) {
    console.error("Moneris order confirm error:", error);
    const message = error instanceof Error ? error.message : "Failed to confirm payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
