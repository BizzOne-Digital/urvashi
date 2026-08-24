import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonVariants } from "@/components/ui/Button";
import { getPublishedPageBySlug, getPublishedServices } from "@/lib/public-data";
import { getPageSection, pageMetadata, sectionText } from "@/lib/page-content";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug("services");
  return pageMetadata(page, {
    title: "Services",
    description: "Custom printing — personalized products on drinkware, apparel, gifts, promotional items, and more.",
  });
}

export default async function ServicesPage() {
  const [services, page] = await Promise.all([getPublishedServices(), getPublishedPageBySlug("services")]);
  const hero = getPageSection(page, "hero");
  const overview = getPageSection(page, "overview");
  const service = services.find((s) => s.slug === "custom-printing") || services[0];

  return (
    <>
      <CmsPageHero
        section={hero}
        fallback={{
          eyebrow: "What we do",
          title: "Custom printing",
          subtitle: "Your idea. Your style. Printed with purpose — on drinkware, apparel, gifts, and more.",
          image: "/demo/ink-lab.svg",
        }}
      />

      <VibrantSection variant="mesh">
        <Container>
          <div className="mb-10" data-reveal>
            <p className="gradient-eyebrow text-xs font-bold uppercase tracking-[0.2em]">Services list</p>
            <h2 className="heading-section mt-2 gradient-heading">
              {sectionText(overview, "heading", "Custom printing")}
            </h2>
            <p className="mt-3 max-w-2xl text-carbon">
              {sectionText(
                overview,
                "body",
                "This is our service — personalized products made to order. Share your artwork or text and we handle the rest."
              )}
            </p>
          </div>

          {!service ? (
            <EmptyState
              title="Service coming soon"
              description="Custom printing details will appear here once published."
              actionLabel="Contact us"
              actionHref="/contact"
            />
          ) : (
            <>
              <Link
                href={`/services/${service.slug}`}
                className="group card-vibrant grid overflow-hidden border-royal-blue/30 bg-gradient-to-br from-pure-paper to-royal-blue/5 lg:grid-cols-2"
                data-reveal
              >
                <div className="relative min-h-[220px] bg-gradient-to-br from-deep-blue/10 to-cyan/10 lg:min-h-[280px]">
                  {service.cardImage?.url && (
                    <Image
                      src={service.cardImage.url}
                      alt={service.title}
                      fill
                      className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                      sizes="50vw"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <h3 className="font-display text-2xl font-bold transition-colors group-hover:text-royal-blue sm:text-3xl">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-carbon">{service.shortDescription}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan">
                    View service details →
                  </span>
                </div>
              </Link>

              <div className="mt-12 flex flex-wrap justify-center gap-4" data-reveal>
                <Link href="/customize" className={cn(buttonVariants("primary"))}>
                  Start your custom order
                </Link>
                <Link href="/shop" className={cn(buttonVariants("secondary"))}>
                  Browse products
                </Link>
              </div>
            </>
          )}
        </Container>
      </VibrantSection>
    </>
  );
}
