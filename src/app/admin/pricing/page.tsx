import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { PricingAdminClient } from "./PricingAdminClient";

export default async function AdminPricingPage() {
  await connectDB();
  const products = await Product.find({ status: "published" }).select("name slug").lean();
  const productList = products.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    slug: p.slug,
  }));

  return <PricingAdminClient products={productList} />;
}
