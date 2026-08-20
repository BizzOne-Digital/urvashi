import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { getShopProducts, getProductCategories } from "@/lib/public-data";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse custom printed mugs, tumblers, apparel, gifts, and promotional products.",
};

interface Props {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const [result, categories] = await Promise.all([
    getShopProducts({
      search: params.search,
      category: params.category,
      page,
      sort: params.sort,
    }),
    getProductCategories(),
  ]);

  const { products, totalPages, total } = result;

  return (
    <>
      <PageHero
        eyebrow="Catalog"
        title="Shop custom prints"
        subtitle="Mugs, tumblers, apparel, gifts, and promotional products — ready to personalize."
        image="/demo/mug-white.svg"
      />

      <VibrantSection variant="mesh" reveal={false}>
        <Container>
          <Suspense fallback={<div className="card-vibrant mb-8 h-16 animate-pulse p-4" data-reveal />}>
            <div className="card-vibrant mb-8 p-4 sm:p-6" data-reveal>
              <ShopFilters
                categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
                currentCategory={params.category}
                currentSearch={params.search}
                currentSort={params.sort}
              />
            </div>
          </Suspense>

          <p className="mt-6 text-sm font-medium text-chrome-mid" data-reveal>{total} product{total !== 1 ? "s" : ""}</p>

          <div className="mt-8">
            <ProductGrid products={products.map((p) => ({ ...p, _id: String(p._id) }))} />
          </div>

          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
              {page > 1 && (
                <Link
                  href={`/shop?${new URLSearchParams({ ...params, page: String(page - 1) } as Record<string, string>).toString()}`}
                  className={cn(buttonVariants("secondary"), "px-4 py-2")}
                >
                  Previous
                </Link>
              )}
              <span className="px-4 text-sm text-carbon">Page {page} of {totalPages}</span>
              {page < totalPages && (
                <Link
                  href={`/shop?${new URLSearchParams({ ...params, page: String(page + 1) } as Record<string, string>).toString()}`}
                  className={cn(buttonVariants("secondary"), "px-4 py-2")}
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </Container>
      </VibrantSection>
    </>
  );
}
