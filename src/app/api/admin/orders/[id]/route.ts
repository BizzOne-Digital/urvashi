import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { serialize } from "@/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { id } = await params;
  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(serialize(order));
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { id } = await params;
  try {
    await connectDB();
    const body = await request.json();
    const session = await requireAdmin();

    const update: Record<string, unknown> = { ...body };

    if (body.productionStatus || body.paymentStatus || body.fulfillmentStatus) {
      const order = await Order.findById(id);
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const statusNote = body.statusNote as string | undefined;
      const newStatus = body.productionStatus || body.paymentStatus || body.fulfillmentStatus;
      if (newStatus) {
        order.statusHistory.push({
          status: newStatus,
          note: statusNote,
          changedAt: new Date(),
          changedBy: session.user.email || session.user.id,
        });
        update.statusHistory = order.statusHistory;
      }
      delete update.statusNote;
    }

    const order = await Order.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(serialize(order.toObject()));
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
