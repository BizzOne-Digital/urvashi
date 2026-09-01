import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaBanner } from "@/components/ui/PageCtaBanner";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ShopCollectionTabs } from "@/components/shop/ShopCollectionTabs";
import { getPublishedPageBySlug, getShopProducts, getProductCategories } from "@/lib/public-data";
import { getPageSection, pageMetadata } from "@/lib/page-content";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const SHOP_QUICK_PICKS = [
  { href: "/shop?collection=new", label: "New arrivals", image: "/products/glass-tumblers/customized.png" },
  { href: "/shop?collection=promo", label: "Promotional", image: "/products/sublimation-pens/customized.png" },
  { href: "/customize", label: "Customize live", image: "/home/customizer-preview.jpg" },
  { href: "/pricing", label: "View pricing", image: "/products/tumblers/card.png" },
];

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
    collection?: string;
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
      collection: params.collection,
      page: pageNum,
      sort: params.sort,
    }),
    getProductCategories(),
    getPublishedPageBySlug("shop"),
  ]);

  const hero = getPageSection(cmsPage, "hero");
  const { products, totalPages, total } = result;
  const showQuickPicks = !params.search && !params.category && !params.collection;

  return (
    <>
      <CmsPageHero
        section={hero}
        fallback={{
          eyebrow: "Catalog",
          title: "Shop custom prints",
          subtitle: "Mugs, tumblers, apparel, gifts, and promotional products — ready to personalize.",
          image: "/images/hero/slide-products.png",
        }}
      />

      <HighlightStrip />

      {showQuickPicks && (
        <VibrantSection variant="cosmic" className="!py-12">
          <Container>
            <SectionHeader
              eyebrow="Start here"
              title="Pick your path"
              subtitle="Browse the catalog, jump to new items, or open the live customizer."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
              {SHOP_QUICK_PICKS.map((pick) => (
                <Link
                  key={pick.href}
                  href={pick.href}
                  className="card-vibrant group overflow-hidden"
                  data-reveal-item
                >
                  <div className="relative aspect-[4/3] bg-[#0a0c14]">
                    <Image
                      src={pick.image}
                      alt={pick.label}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      sizes="25vw"
                    />
                  </div>
                  <div className="border-t border-white/10 p-4">
                    <p className="font-semibold text-pure-paper group-hover:text-cyan">{pick.label}</p>
                    <span className="mt-1 text-xs font-bold uppercase tracking-wide text-cyan">Explore →</span>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </VibrantSection>
      )}

      <VibrantSection variant="mesh" reveal={false}>
        <Container>
          <Suspense fallback={<div className="mb-6 h-10 animate-pulse rounded-full bg-white/5" />}>
            <ShopCollectionTabs currentCollection={params.collection} className="mb-6" />
          </Suspense>

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

          <p className="text-sm font-medium text-chrome-mid" data-reveal>
            {total} product{total !== 1 ? "s" : ""}
          </p>

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
              <span className="px-4 text-sm text-chrome-light">Page {pageNum} of {totalPages}</span>
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

      <PageCtaBanner
        title="Need something custom?"
        description="Upload artwork, add text, and preview your design before you order."
        primaryHref="/customize"
        primaryLabel="Open customizer"
        secondaryHref="/contact"
        secondaryLabel="Get a quote"
      />
    </>
  );
}
