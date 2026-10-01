import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import BookingRequest from "@/models/BookingRequest";
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
  const booking = await BookingRequest.findById(id).lean();
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json(serialize(booking));
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
    const existing = await BookingRequest.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (body.status && body.status !== existing.status) {
      existing.statusHistory.push({
        status: body.status,
        note: body.statusNote,
        changedAt: new Date(),
      });
      body.statusHistory = existing.statusHistory;
      delete body.statusNote;
    }

    const booking = await BookingRequest.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    return NextResponse.json(serialize(booking!.toObject()));
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
