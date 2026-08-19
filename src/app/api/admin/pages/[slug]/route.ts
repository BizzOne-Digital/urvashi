import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import Page from "@/models/Page";
import { serialize } from "@/lib/serialize";
import { revalidatePage } from "@/lib/revalidation";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { slug } = await params;
  await connectDB();
  const page = await Page.findOne({ slug }).lean();
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  return NextResponse.json(serialize(page));
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { slug } = await params;
  try {
    await connectDB();
    const body = await request.json();
    const page = await Page.findOneAndUpdate(
      { slug },
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    revalidatePage(slug);
    return NextResponse.json(serialize(page.toObject()));
  } catch (error) {
    console.error("Page update error:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}
