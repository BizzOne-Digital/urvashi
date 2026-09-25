import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { serializeDocs, serialize } from "@/lib/serialize";
import { revalidateServices, revalidateService } from "@/lib/revalidation";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  await connectDB();
  const services = await Service.find().sort({ order: 1, updatedAt: -1 }).lean();
  return NextResponse.json(serializeDocs(services));
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

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const slug = body.slug || slugify(body.title);
    const existing = await Service.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "Service with this slug already exists" }, { status: 400 });
    }

    const service = await Service.create({
      title: body.title,
      slug,
      shortDescription: body.shortDescription,
      cardImage: body.cardImage,
      icon: body.icon,
      accentColor: body.accentColor,
      ctaText: body.ctaText,
      ctaUrl: body.ctaUrl,
      order: body.order ?? 0,
      status: body.status || "draft",
      detail: body.detail || {},
      seo: body.seo || {},
    });

    revalidateServices();
    return NextResponse.json(serialize(service.toObject()), { status: 201 });
  } catch (error) {
    console.error("Service create error:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
