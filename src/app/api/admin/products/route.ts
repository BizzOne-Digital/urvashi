import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { serializeDocs } from "@/lib/serialize";
import { revalidateProducts, revalidateProduct } from "@/lib/revalidation";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  await connectDB();
  const products = await Product.find().sort({ updatedAt: -1 }).lean();
  return NextResponse.json(serializeDocs(products));
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

    if (!body.name || !body.sku) {
      return NextResponse.json({ error: "Name and SKU are required" }, { status: 400 });
    }

    const slug = body.slug || slugify(body.name);
    const existing = await Product.findOne({ $or: [{ slug }, { sku: body.sku }] });
    if (existing) {
      return NextResponse.json({ error: "Product with this slug or SKU already exists" }, { status: 400 });
    }

    const product = await Product.create({
      ...body,
      slug,
      currency: body.currency || "CAD",
      minQuantity: body.minQuantity ?? 1,
      quantityStep: body.quantityStep ?? 1,
      pricingMode: body.pricingMode || "fixed",
      availability: body.availability || "in_stock",
      status: body.status || "draft",
      tags: body.tags || [],
      variants: body.variants || [],
      printLocations: body.printLocations || [],
      customizationFields: body.customizationFields || [],
      optionSurcharges: body.optionSurcharges || [],
      images: body.images || [],
      customizer: body.customizer || { enabled: false },
      featured: body.featured ?? false,
      onSale: body.onSale ?? false,
      relatedProductIds: body.relatedProductIds || [],
      relatedGalleryIds: body.relatedGalleryIds || [],
      seo: body.seo || {},
    });

    revalidateProducts();
    return NextResponse.json(serializeDocs([product])[0], { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
