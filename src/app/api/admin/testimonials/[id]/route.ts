import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { serialize } from "@/lib/serialize";
import { revalidateTestimonials } from "@/lib/revalidation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { id } = await params;
  await connectDB();
  const testimonial = await Testimonial.findById(id).lean();
  if (!testimonial) {
    return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
  }
  return NextResponse.json(serialize(testimonial));
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
    const testimonial = await Testimonial.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }
    revalidateTestimonials();
    return NextResponse.json(serialize(testimonial.toObject()));
  } catch (error) {
    console.error("Testimonial update error:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
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
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }
    revalidateTestimonials();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Testimonial delete error:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
