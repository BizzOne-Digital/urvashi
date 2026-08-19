import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import PricingRule from "@/models/PricingRule";
import { serializeDocs, serialize } from "@/lib/serialize";
import { revalidateProducts } from "@/lib/revalidation";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  await connectDB();
  const rules = await PricingRule.find().sort({ updatedAt: -1 }).lean();
  return NextResponse.json(serializeDocs(rules));
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
    const rule = await PricingRule.create({
      productId: body.productId,
      productSlug: body.productSlug,
      productName: body.productName,
      basePrice: body.basePrice,
      currency: body.currency || "CAD",
      pricingMode: body.pricingMode || "fixed",
      minQuantity: body.minQuantity ?? 1,
      quantityTiers: body.quantityTiers || [],
      variantSurcharges: body.variantSurcharges || [],
      printLocationSurcharges: body.printLocationSurcharges || [],
      publicNote: body.publicNote,
      adminNote: body.adminNote,
      effectiveFrom: body.effectiveFrom,
      effectiveTo: body.effectiveTo,
      isActive: body.isActive ?? true,
    });

    revalidateProducts();
    return NextResponse.json(serialize(rule.toObject()), { status: 201 });
  } catch (error) {
    console.error("Pricing rule create error:", error);
    return NextResponse.json({ error: "Failed to create pricing rule" }, { status: 500 });
  }
}
