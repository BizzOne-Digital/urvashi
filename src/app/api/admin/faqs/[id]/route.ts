import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import FAQ from "@/models/FAQ";
import { serialize } from "@/lib/serialize";
import { revalidateFaqs } from "@/lib/revalidation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { id } = await params;
  await connectDB();
  const faq = await FAQ.findById(id).lean();
  if (!faq) {
    return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  }
  return NextResponse.json(serialize(faq));
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
    const faq = await FAQ.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }
    revalidateFaqs();
    return NextResponse.json(serialize(faq.toObject()));
  } catch (error) {
    console.error("FAQ update error:", error);
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
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
    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }
    revalidateFaqs();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FAQ delete error:", error);
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
