import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { getPublishedServices, getServiceBySlug } from "@/lib/public-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = await getPublishedServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.seo?.title || service.title,
    description: service.seo?.description || service.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const detail = service.detail || {};
  const sectionImages = detail.sectionImages || [];
  const processSteps = detail.processSteps || [];

  return (
    <>
      <PageHero
        title={detail.heroHeading || service.title}
        subtitle={detail.heroSubheading || service.shortDescription}
        image={detail.heroImage?.url || "/demo/ink-lab.svg"}
        dark
      />

      <section className="py-16">
        <Container className="max-w-3xl">
          {detail.overview && <p className="text-lg leading-relaxed text-carbon">{detail.overview}</p>}
        </Container>
      </section>

      {detail.suitableUses && detail.suitableUses.length > 0 && (
        <section className="border-t border-chrome-light/40 py-16">
          <Container>
            <h2 className="heading-section">Suitable uses</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {detail.suitableUses.map((use) => (
                <li key={use} className="rounded-sm border border-chrome-light/60 px-4 py-3 text-sm font-medium">{use}</li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {sectionImages.length > 0 && (
        <section className="py-16">
          <Container>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sectionImages.map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-sm border border-chrome-light/60">
                  <Image src={img.url} alt={img.alt || service.title} fill className="object-contain p-4" sizes="33vw" />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {processSteps.length > 0 && (
        <section className="section-dark py-16">
          <Container>
            <h2 className="heading-section">Our process</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {processSteps.map((step, i) => (
                <div key={step.title}>
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-sm bg-carbon">
                    {step.image?.url && (
                      <Image src={step.image.url} alt={step.title} fill className="object-contain p-4" sizes="33vw" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-cyan">Step {i + 1}</p>
                  <h3 className="mt-1 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-chrome-light">{step.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {(detail.pricingNote || detail.minimumOrderNote) && (
        <section className="py-16">
          <Container className="max-w-3xl space-y-4">
            {detail.pricingNote && <p className="text-carbon"><strong>Pricing:</strong> {detail.pricingNote}</p>}
            {detail.minimumOrderNote && <p className="text-carbon"><strong>Minimum order:</strong> {detail.minimumOrderNote}</p>}
          </Container>
        </section>
      )}

      <section className="border-t border-chrome-light/40 py-16">
        <Container className="flex flex-wrap gap-4">
          <Link href={detail.ctaUrl || "/contact"} className={buttonVariants("primary")}>
            {detail.ctaText || "Contact us"}
          </Link>
          <Link href="/services" className={buttonVariants("secondary")}>All services</Link>
        </Container>
      </section>
    </>
  );
}
