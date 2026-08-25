import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { getPublishedPageBySlug, getShopProducts, getProductCategories } from "@/lib/public-data";
import { getPageSection, pageMetadata } from "@/lib/page-content";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug("shop");
  return pageMetadata(page, {
    title: "Shop",
    description: "Browse custom printed mugs, tumblers, apparel, gifts, and promotional products.",
  });
}

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
  const pageNum = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const [result, categories, cmsPage] = await Promise.all([
    getShopProducts({
      search: params.search,
      category: params.category,
      page: pageNum,
      sort: params.sort,
    }),
    getProductCategories(),
    getPublishedPageBySlug("shop"),
  ]);

  const hero = getPageSection(cmsPage, "hero");
  const { products, totalPages, total } = result;

  return (
    <>
      <CmsPageHero
        section={hero}
        fallback={{
          eyebrow: "Catalog",
          title: "Shop custom prints",
          subtitle: "Mugs, tumblers, apparel, gifts, and promotional products — ready to personalize.",
          image: "/demo/mug-white.svg",
        }}
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
              {pageNum > 1 && (
                <Link
                  href={`/shop?${new URLSearchParams({ ...params, page: String(pageNum - 1) } as Record<string, string>).toString()}`}
                  className={cn(buttonVariants("secondary"), "px-4 py-2")}
                >
                  Previous
                </Link>
              )}
              <span className="px-4 text-sm text-carbon">Page {pageNum} of {totalPages}</span>
              {pageNum < totalPages && (
                <Link
                  href={`/shop?${new URLSearchParams({ ...params, page: String(pageNum + 1) } as Record<string, string>).toString()}`}
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
