import type { Metadata } from "next";
import Link from "next/link";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaBanner } from "@/components/ui/PageCtaBanner";
import { buttonVariants } from "@/components/ui/Button";
import { getActivePricingRules, getPublishedPageBySlug, getPublishedProducts } from "@/lib/public-data";
import { PRICING_CATALOG } from "@/lib/product-pricing";
import { getPageSection, pageMetadata, sectionText } from "@/lib/page-content";
import { cn, formatCurrency } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug("pricing");
  return pageMetadata(page, {
    title: "Pricing",
    description:
      "Confirmed starting prices for custom mugs, tumblers, apparel, gifts, promotional items, and seasonal printing at DPM Custom Prints.",
  });
}

export default async function PricingPage() {
  const [products, rules, page] = await Promise.all([
    getPublishedProducts(),
    getActivePricingRules(),
    getPublishedPageBySlug("pricing"),
  ]);

  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const ruleBySlug = new Map(rules.map((r) => [r.productSlug, r]));
  const hero = getPageSection(page, "hero");
  const tableSection = getPageSection(page, "table");
  const quoteSection = getPageSection(page, "quote-note");

  const rows = PRICING_CATALOG.map((entry) => {
    const product = productBySlug.get(entry.slug);
    const rule = ruleBySlug.get(entry.slug);
    const currency = product?.currency || rule?.currency || "CAD";
    const isQuote =
      entry.quote ||
      rule?.pricingMode === "quote" ||
      product?.pricingMode === "quote" ||
      product?.availability === "quote_only";

    if (isQuote) {
      return {
        ...entry,
        priceDisplay: "Contact for price",
        note: rule?.publicNote || entry.note,
        isQuote: true,
        shopHref: product ? `/shop/${entry.slug}` : "/contact",
      };
    }

    const price = rule?.basePrice ?? product?.price ?? entry.price;
    const minQuantity = rule?.minQuantity ?? product?.minQuantity ?? entry.minQuantity ?? 1;
    const note = rule?.publicNote || entry.note;

    return {
      ...entry,
      priceDisplay:
        price != null
          ? minQuantity > 1
            ? `${formatCurrency(price, currency)} each (min. ${minQuantity})`
            : formatCurrency(price, currency)
          : "Contact for price",
      note,
      isQuote: false,
      shopHref: `/shop/${entry.slug}`,
    };
  });

  const fixedRows = rows.filter((r) => !r.isQuote);
  const quoteRows = rows.filter((r) => r.isQuote);

  return (
    <>
      <CmsPageHero
        section={hero}
        fallback={{
          eyebrow: "Pricing details",
          title: "Clear starting prices",
          subtitle: "Confirmed pricing where available. Contact us for quotes on select apparel and home items.",
        }}
      />

      <HighlightStrip />

      <VibrantSection variant="cosmic" className="!py-12">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3" data-reveal-stagger>
            <div className="card-vibrant p-6 text-center" data-reveal-item>
              <p className="font-display text-3xl font-bold gradient-heading">{fixedRows.length}</p>
              <p className="mt-1 text-sm text-chrome-mid">Confirmed prices</p>
            </div>
            <div className="card-vibrant p-6 text-center" data-reveal-item>
              <p className="font-display text-3xl font-bold gradient-heading">{quoteRows.length}</p>
              <p className="mt-1 text-sm text-chrome-mid">Quote items</p>
            </div>
            <div className="card-vibrant p-6 text-center" data-reveal-item>
              <p className="font-display text-3xl font-bold gradient-heading">CAD</p>
              <p className="mt-1 text-sm text-chrome-mid">All listed in Canadian dollars</p>
            </div>
          </div>
        </Container>
      </VibrantSection>

      <VibrantSection variant="mesh">
        <Container>
          <SectionHeader
            eyebrow="Pricing details"
            title={sectionText(tableSection, "heading", "Confirmed starting prices")}
            subtitle={sectionText(
              tableSection,
              "body",
              "All listed prices are starting points in CAD. Final totals may include customization, shipping, and taxes at checkout or invoice."
            )}
            className="mb-8"
          />

          <div className="card-vibrant overflow-hidden" data-reveal>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04]">
                    <th className="px-4 py-4 font-display font-semibold text-pure-paper sm:px-6">Product</th>
                    <th className="px-4 py-4 font-display font-semibold text-pure-paper sm:px-6">Price</th>
                    <th className="hidden px-4 py-4 font-display font-semibold text-pure-paper sm:table-cell sm:px-6">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedRows.map((row) => (
                    <tr key={row.slug} className="border-b border-white/10 last:border-0">
                      <td className="px-4 py-4 sm:px-6">
                        <Link href={row.shopHref} className="font-medium text-pure-paper hover:text-cyan">
                          {row.displayName}
                        </Link>
                      </td>
                      <td className="px-4 py-4 font-semibold text-cyan sm:px-6">{row.priceDisplay}</td>
                      <td className="hidden px-4 py-4 text-chrome-light sm:table-cell sm:px-6">{row.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {quoteRows.length > 0 && (
            <div className="mt-10" data-reveal>
              <h2 className="heading-section text-xl gradient-heading-light">
                {sectionText(quoteSection, "heading", "Contact for pricing")}
              </h2>
              <p className="mt-2 text-chrome-light">
                {sectionText(
                  quoteSection,
                  "body",
                  "These items require a custom quote based on size, material, and print options."
                )}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {quoteRows.map((row) => (
                  <div key={row.slug} className="card-vibrant flex items-center justify-between gap-4 p-4">
                    <span className="font-medium text-pure-paper">{row.displayName}</span>
                    <Link href="/contact" className="text-sm font-semibold text-cyan hover:underline">
                      Get a quote →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-4" data-reveal>
            <Link href="/shop" className={cn(buttonVariants("primary"))}>
              Browse products
            </Link>
            <Link href="/contact" className={cn(buttonVariants("secondary"))}>
              Request a quote
            </Link>
          </div>
        </Container>
      </VibrantSection>

      <PageCtaBanner
        title="See your total before you pay"
        description="Checkout shows Canada Post shipping and provincial tax automatically."
        primaryHref="/shop"
        primaryLabel="Browse products"
        secondaryHref="/customize"
        secondaryLabel="Open customizer"
      />
    </>
  );
}
