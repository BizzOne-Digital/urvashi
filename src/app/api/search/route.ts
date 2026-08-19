import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const category = searchParams.get("category")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [], query: q });
    }

    await connectDB();

    const filter: Record<string, unknown> = {
      status: "published",
      $text: { $search: q },
    };

    if (category) {
      filter.categorySlug = category;
    }

    let products = await Product.find(filter, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .select(
        "name slug sku shortDescription price pricingMode currency availability images categorySlug tags"
      )
      .lean();

    if (products.length === 0) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const fallbackFilter: Record<string, unknown> = {
        status: "published",
        $or: [
          { name: regex },
          { shortDescription: regex },
          { tags: regex },
          { sku: regex },
        ],
      };
      if (category) fallbackFilter.categorySlug = category;

      products = await Product.find(fallbackFilter)
        .limit(limit)
        .select(
          "name slug sku shortDescription price pricingMode currency availability images categorySlug tags"
        )
        .lean();
    }

    const results = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      shortDescription: p.shortDescription,
      price: p.price,
      pricingMode: p.pricingMode,
      currency: p.currency,
      availability: p.availability,
      image: p.images?.[0]?.url,
      categorySlug: p.categorySlug,
      tags: p.tags,
    }));

    return NextResponse.json({ results, query: q, count: results.length });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
