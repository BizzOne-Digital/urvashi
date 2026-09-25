import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import GalleryCategory from "@/models/GalleryCategory";
import MediaAsset from "@/models/MediaAsset";
import { serializeDocs, serialize } from "@/lib/serialize";
import { revalidateGallery } from "@/lib/revalidation";

type Params = { params: Promise<{ categoryId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { categoryId } = await params;
  await connectDB();

  const category = await GalleryCategory.findById(categoryId).lean();
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const assets = await MediaAsset.find({ galleryCategoryId: categoryId })
    .sort({ order: 1, createdAt: -1 })
    .lean();

  return NextResponse.json({
    category: serialize(category),
    assets: serializeDocs(assets),
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { categoryId } = await params;
  try {
    await connectDB();
    const body = await request.json();

    if (body.category) {
      await GalleryCategory.findByIdAndUpdate(categoryId, { $set: body.category });
    }

    if (body.assets && Array.isArray(body.assets)) {
      for (const asset of body.assets) {
        if (asset._id || asset.id) {
          const assetId = asset._id || asset.id;
          await MediaAsset.findByIdAndUpdate(assetId, { $set: asset });
        }
      }
    }

    if (body.newAsset) {
      await MediaAsset.create({
        ...body.newAsset,
        galleryCategoryId: categoryId,
        isPrivate: false,
        isPublished: true,
      });
    }

    revalidateGallery();
    const category = await GalleryCategory.findById(categoryId).lean();
    const assets = await MediaAsset.find({ galleryCategoryId: categoryId })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      category: serialize(category),
      assets: serializeDocs(assets),
    });
  } catch (error) {
    console.error("Gallery update error:", error);
    return NextResponse.json({ error: "Failed to update gallery" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { categoryId } = await params;
  try {
    await connectDB();
    await MediaAsset.deleteMany({ galleryCategoryId: categoryId });
    const category = await GalleryCategory.findByIdAndDelete(categoryId);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    revalidateGallery();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery delete error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
