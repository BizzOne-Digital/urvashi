import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import PricingRule from "@/models/PricingRule";
import Product from "@/models/Product";
import { serialize } from "@/lib/serialize";
import { revalidateProducts } from "@/lib/revalidation";

type Params = { params: Promise<{ id: string }> };

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
    const rule = await PricingRule.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!rule) {
      return NextResponse.json({ error: "Pricing rule not found" }, { status: 404 });
    }

    if (rule.productId) {
      const productUpdate: Record<string, unknown> = {};
      if (body.basePrice !== undefined) productUpdate.price = body.basePrice;
      if (body.pricingMode !== undefined) {
        productUpdate.pricingMode = body.pricingMode;
        productUpdate.availability = body.pricingMode === "quote" ? "quote_only" : "in_stock";
      }
      if (body.minQuantity !== undefined) productUpdate.minQuantity = body.minQuantity;
      if (Object.keys(productUpdate).length > 0) {
        await Product.findByIdAndUpdate(rule.productId, { $set: productUpdate });
      }
    }

    revalidateProducts();
    return NextResponse.json(serialize(rule.toObject()));
  } catch (error) {
    console.error("Pricing rule update error:", error);
    return NextResponse.json({ error: "Failed to update pricing rule" }, { status: 500 });
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
    const rule = await PricingRule.findByIdAndDelete(id);
    if (!rule) {
      return NextResponse.json({ error: "Pricing rule not found" }, { status: 404 });
    }
    revalidateProducts();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pricing rule delete error:", error);
    return NextResponse.json({ error: "Failed to delete pricing rule" }, { status: 500 });
  }
}
