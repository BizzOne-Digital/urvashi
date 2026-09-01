import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { buttonVariants } from "@/components/ui/Button";
import { getPublishedServices, getServiceBySlug } from "@/lib/public-data";
import { resolveImageSrc } from "@/lib/image-url";

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
  const heroImage = detail.heroImage?.url;

  return (
    <>
      <PageHero
        title={detail.heroHeading || service.title}
        subtitle={detail.heroSubheading || service.shortDescription}
        image={heroImage ? resolveImageSrc(heroImage) : undefined}
        dark
      />

      {detail.overview && (
        <VibrantSection variant="mesh" reveal={false}>
          <Container className="max-w-3xl">
            <p className="text-lg leading-relaxed text-chrome-light">{detail.overview}</p>
          </Container>
        </VibrantSection>
      )}

      {detail.suitableUses && detail.suitableUses.length > 0 && (
        <VibrantSection variant="cosmic">
          <Container>
            <h2 className="heading-section gradient-heading-light">Suitable uses</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {detail.suitableUses.map((use) => (
                <li
                  key={use}
                  className="rounded-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-chrome-light"
                >
                  {use}
                </li>
              ))}
            </ul>
          </Container>
        </VibrantSection>
      )}

      {detail.productOptions && detail.productOptions.length > 0 && (
        <VibrantSection variant="aurora">
          <Container>
            <h2 className="heading-section gradient-heading-light">Product options</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {detail.productOptions.map((option) => (
                <div key={option} className="card-vibrant px-4 py-3 text-sm font-medium text-pure-paper">
                  {option}
                </div>
              ))}
            </div>
          </Container>
        </VibrantSection>
      )}

      {sectionImages.length > 0 && (
        <VibrantSection variant="mesh">
          <Container>
            <h2 className="heading-section gradient-heading-light">Examples</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sectionImages.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
                >
                  <Image
                    src={resolveImageSrc(img.url)}
                    alt={img.alt || service.title}
                    fill
                    className="object-contain p-4"
                    sizes="33vw"
                  />
                </div>
              ))}
            </div>
          </Container>
        </VibrantSection>
      )}

      {processSteps.length > 0 && (
        <VibrantSection variant="neon">
          <Container>
            <h2 className="heading-section gradient-heading-light">Our process</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {processSteps.map((step, i) => (
                <div key={step.title} className="card-vibrant overflow-hidden">
                  <div className="relative mb-0 aspect-video bg-[#0a0c14]">
                    {step.image?.url && (
                      <Image
                        src={resolveImageSrc(step.image.url)}
                        alt={step.title}
                        fill
                        className="object-contain p-4"
                        sizes="33vw"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-bold text-cyan">Step {i + 1}</p>
                    <h3 className="mt-1 font-display text-lg font-semibold text-pure-paper">{step.title}</h3>
                    <p className="mt-2 text-sm text-chrome-light">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </VibrantSection>
      )}

      {(detail.customizationOptions?.length || detail.artworkGuidance) && (
        <VibrantSection variant="cosmic">
          <Container className="max-w-3xl space-y-6">
            {detail.customizationOptions && detail.customizationOptions.length > 0 && (
              <div>
                <h2 className="heading-section gradient-heading-light">Customization options</h2>
                <ul className="mt-4 space-y-2 text-chrome-light">
                  {detail.customizationOptions.map((option) => (
                    <li key={option} className="flex items-start gap-2">
                      <span className="text-cyan">•</span>
                      <span>{option}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {detail.artworkGuidance && (
              <p className="text-chrome-light">
                <strong className="text-pure-paper">Artwork:</strong> {detail.artworkGuidance}
              </p>
            )}
          </Container>
        </VibrantSection>
      )}

      {(detail.pricingNote || detail.minimumOrderNote || detail.importantNotes) && (
        <VibrantSection variant="mesh">
          <Container className="max-w-3xl space-y-4 text-chrome-light">
            {detail.pricingNote && (
              <p>
                <strong className="text-pure-paper">Pricing:</strong> {detail.pricingNote}
              </p>
            )}
            {detail.minimumOrderNote && (
              <p>
                <strong className="text-pure-paper">Minimum order:</strong> {detail.minimumOrderNote}
              </p>
            )}
            {detail.importantNotes && (
              <p>
                <strong className="text-pure-paper">Please note:</strong> {detail.importantNotes}
              </p>
            )}
          </Container>
        </VibrantSection>
      )}

      {detail.faqs && detail.faqs.length > 0 && (
        <VibrantSection variant="aurora">
          <Container className="max-w-3xl">
            <h2 className="heading-section gradient-heading-light">Common questions</h2>
            <div className="mt-8 space-y-4">
              {detail.faqs.map((faq) => (
                <div key={faq.question} className="card-vibrant p-5">
                  <h3 className="font-semibold text-pure-paper">{faq.question}</h3>
                  <p className="mt-2 text-sm text-chrome-light">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Container>
        </VibrantSection>
      )}

      <VibrantSection variant="mesh">
        <Container className="flex flex-wrap gap-4">
          <Link href={detail.ctaUrl || service.ctaUrl || "/customize"} className={buttonVariants("primary")}>
            {detail.ctaText || service.ctaText || "Start your custom order"}
          </Link>
          <Link href="/shop" className={buttonVariants("secondary")}>Browse products</Link>
          <Link href="/services" className={buttonVariants("secondary")}>All services</Link>
        </Container>
      </VibrantSection>
    </>
  );
}
