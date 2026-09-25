import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getSettings } from "@/lib/settings";
import { resolveHomeViral } from "@/lib/home-viral";
import { HomeViralForm } from "./HomeViralForm";

export default async function AdminHomeViralPage() {
  const settings = await getSettings();
  const homeViral = resolveHomeViral(
    settings.homeViral
      ? {
          ...settings.homeViral,
          productSlugs: settings.homeViral.productSlugs,
          items: settings.homeViral.items,
          lastUpdatedAt: settings.homeViral.lastUpdatedAt?.toISOString(),
        }
      : null
  );

  await connectDB();
  const products = await Product.find({ status: "published" }, { name: 1, slug: 1 })
    .sort({ name: 1 })
    .lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-carbon">Homepage — viral products</h1>
        <p className="mt-1 text-sm text-chrome-mid">
          Manage the &ldquo;Our viral products&rdquo; section on the home page. For each product, use{" "}
          <strong>Add photos &amp; videos</strong> to upload images, video files, or YouTube links.
        </p>
      </div>
      <HomeViralForm
        initialConfig={homeViral}
        products={products.map((p) => ({ slug: p.slug, name: p.name }))}
      />
    </div>
  );
}
