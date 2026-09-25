import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { serialize } from "@/lib/serialize";
import { revalidateServices, revalidateService } from "@/lib/revalidation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { id } = await params;
  await connectDB();
  const service = await Service.findById(id).lean();
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
  return NextResponse.json(serialize(service));
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
    const service = await Service.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    revalidateService(service.slug);
    return NextResponse.json(serialize(service.toObject()));
  } catch (error) {
    console.error("Service update error:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { id } = await params;
  try {
    await connectDB();
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    revalidateServices();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Service delete error:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
