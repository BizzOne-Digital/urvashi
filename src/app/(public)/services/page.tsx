import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { PageCtaBanner } from "@/components/ui/PageCtaBanner";
import { buttonVariants } from "@/components/ui/Button";
import { getPublishedPageBySlug, getPublishedServices } from "@/lib/public-data";
import { getPageSection, pageMetadata, sectionText } from "@/lib/page-content";
import { resolveImageSrc } from "@/lib/image-url";
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
  const featured = services.find((s) => s.slug === "custom-printing") || services[0];
  const detail = featured?.detail || {};

  return (
    <>
      <CmsPageHero
        section={hero}
        fallback={{
          eyebrow: "What we do",
          title: "Custom printing",
          subtitle: "Your idea. Your style. Printed with purpose — on drinkware, apparel, gifts, and more.",
        }}
      />

      <HighlightStrip />

      <VibrantSection variant="mesh">
        <Container>
          <div className="mb-10" data-reveal>
            <p className="gradient-eyebrow text-xs font-bold uppercase tracking-[0.2em]">Services list</p>
            <h2 className="heading-section mt-2 gradient-heading">
              {sectionText(overview, "heading", "Custom printing")}
            </h2>
            <p className="mt-3 max-w-2xl text-chrome-light">
              {sectionText(
                overview,
                "body",
                "This is our service — personalized products made to order. Share your artwork or text and we handle the rest."
              )}
            </p>
          </div>

          <div className="space-y-8">
            {services.map((service) => (
              <Link
                key={String(service._id)}
                href={`/services/${service.slug}`}
                className="group card-vibrant grid overflow-hidden lg:grid-cols-2"
                data-reveal
              >
                <div className="relative min-h-[220px] bg-gradient-to-br from-deep-blue/20 to-cyan/10 lg:min-h-[280px]">
                  {service.cardImage?.url && (
                    <Image
                      src={resolveImageSrc(service.cardImage.url)}
                      alt={service.cardImage.alt || service.title}
                      fill
                      className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                      sizes="50vw"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <h3 className="font-display text-2xl font-bold text-pure-paper transition-colors group-hover:text-cyan sm:text-3xl">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-chrome-light">{service.shortDescription}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan">
                    View service details →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {detail.suitableUses && detail.suitableUses.length > 0 && (
            <div className="mt-14" data-reveal>
              <h3 className="heading-section text-xl gradient-heading-light">Great for</h3>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {detail.suitableUses.map((use) => (
                  <li
                    key={use}
                    className="rounded-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-chrome-light"
                  >
                    {use}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detail.productOptions && detail.productOptions.length > 0 && (
            <div className="mt-14" data-reveal>
              <h3 className="heading-section text-xl gradient-heading-light">What we print</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {detail.productOptions.map((option) => (
                  <div
                    key={option}
                    className="card-vibrant px-4 py-3 text-sm font-medium text-pure-paper"
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail.processSteps && detail.processSteps.length > 0 && (
            <div className="mt-14" data-reveal>
              <h3 className="heading-section text-xl gradient-heading-light">How it works</h3>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {detail.processSteps.map((step, index) => (
                  <div key={step.title} className="card-vibrant group overflow-hidden">
                    {step.image?.url && (
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#0a0c14]">
                        <Image
                          src={resolveImageSrc(step.image.url)}
                          alt={step.image.alt || step.title}
                          fill
                          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          sizes="33vw"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-cyan">Step {index + 1}</p>
                      <h4 className="mt-1 font-display text-lg font-semibold text-pure-paper">{step.title}</h4>
                      <p className="mt-2 text-sm text-chrome-light">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 flex flex-wrap justify-center gap-4" data-reveal>
            <Link href="/customize" className={cn(buttonVariants("primary"))}>
              Start your custom order
            </Link>
            <Link href="/shop" className={cn(buttonVariants("secondary"))}>
              Browse products
            </Link>
            <Link href="/contact" className={cn(buttonVariants("secondary"))}>
              Request a quote
            </Link>
          </div>
        </Container>
      </VibrantSection>

      <PageCtaBanner
        title="Ready to print your idea?"
        description="Start in the customizer or browse products with confirmed starting prices."
        primaryHref="/customize"
        primaryLabel="Start your custom order"
        secondaryHref="/contact"
        secondaryLabel="Get a quote"
      />
    </>
  );
}
