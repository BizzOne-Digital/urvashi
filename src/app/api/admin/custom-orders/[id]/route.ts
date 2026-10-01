import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import CustomOrderRequest from "@/models/CustomOrderRequest";
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
  const request_ = await CustomOrderRequest.findById(id).lean();
  if (!request_) {
    return NextResponse.json({ error: "Custom order not found" }, { status: 404 });
  }
  return NextResponse.json(serialize(request_));
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
    const existing = await CustomOrderRequest.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Custom order not found" }, { status: 404 });
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

    const updated = await CustomOrderRequest.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    return NextResponse.json(serialize(updated!.toObject()));
  } catch (error) {
    console.error("Custom order update error:", error);
    return NextResponse.json({ error: "Failed to update custom order" }, { status: 500 });
  }
}
