import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import GalleryCategory from "@/models/GalleryCategory";
import MediaAsset from "@/models/MediaAsset";
import { serializeDocs, serialize } from "@/lib/serialize";
import { revalidateGallery } from "@/lib/revalidation";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  await connectDB();
  const categories = await GalleryCategory.find().sort({ order: 1 }).lean();
  return NextResponse.json(serializeDocs(categories));
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
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = body.slug || slugify(body.name);
    const existing = await GalleryCategory.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "Category with this slug already exists" }, { status: 400 });
    }

    const category = await GalleryCategory.create({
      name: body.name,
      slug,
      description: body.description,
      coverImage: body.coverImage,
      order: body.order ?? 0,
      status: body.status || "active",
    });

    revalidateGallery();
    return NextResponse.json(serialize(category.toObject()), { status: 201 });
  } catch (error) {
    console.error("Gallery category create error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
