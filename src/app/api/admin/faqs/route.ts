import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import FAQ from "@/models/FAQ";
import { serializeDocs, serialize } from "@/lib/serialize";
import { revalidateFaqs } from "@/lib/revalidation";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  await connectDB();
  const faqs = await FAQ.find().sort({ category: 1, order: 1 }).lean();
  return NextResponse.json(serializeDocs(faqs));
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  try {
    await connectDB();
    const body = await request.json();
    if (!body.question || !body.answer || !body.category) {
      return NextResponse.json({ error: "Question, answer, and category are required" }, { status: 400 });
    }

    const faq = await FAQ.create({
      question: body.question,
      answer: body.answer,
      category: body.category,
      relatedProductId: body.relatedProductId,
      relatedServiceId: body.relatedServiceId,
      relatedPageSlug: body.relatedPageSlug,
      order: body.order ?? 0,
      status: body.status || "draft",
    });

    revalidateFaqs();
    return NextResponse.json(serialize(faq.toObject()), { status: 201 });
  } catch (error) {
    console.error("FAQ create error:", error);
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}
