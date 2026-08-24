import type { Metadata } from "next";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { BookingForm } from "@/components/forms/BookingForm";
import { DpmProductImage } from "@/components/ui/DpmProductImage";
import { getCachedSettings } from "@/lib/settings";
import { DEMO_IMAGES, getPublishedPageBySlug } from "@/lib/public-data";
import { getPageSection, pageMetadata } from "@/lib/page-content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug("booking");
  return pageMetadata(page, {
    title: "Book a Consultation",
    description: "Request a consultation with DPM Custom Prints for custom orders, design review, or large projects.",
  });
}

export default async function BookingPage() {
  const [settings, page] = await Promise.all([getCachedSettings(), getPublishedPageBySlug("booking")]);
  const hero = getPageSection(page, "hero");

  return (
    <>
      <CmsPageHero
        section={hero}
        fallback={{
          eyebrow: "Consultation",
          title: "Book a consultation",
          subtitle: "Share your project details and preferred times. This is a request — not a confirmed appointment.",
          image: "/demo/ink-lab.svg",
        }}
      />

      <VibrantSection variant="mesh">
        <Container className="grid min-w-0 gap-12 lg:grid-cols-2">
          <div data-reveal>
            <h2 className="font-display text-2xl font-bold gradient-heading">How it works</h2>
            <ol className="mt-6 space-y-4 text-sm text-carbon">
              <li className="card-vibrant flex gap-3 p-4"><span className="font-bold text-royal-blue">1.</span> Submit your consultation request with project details.</li>
              <li className="card-vibrant flex gap-3 p-4"><span className="font-bold text-royal-blue">2.</span> We review your request and contact you to confirm availability.</li>
              <li className="card-vibrant flex gap-3 p-4"><span className="font-bold text-royal-blue">3.</span> We discuss options, pricing, and next steps for your order.</li>
            </ol>
            <div className="mt-8 grid grid-cols-3 gap-3" data-reveal-stagger>
              {DEMO_IMAGES.slice(0, 6).map((src) => (
                <div key={src} className="card-vibrant relative aspect-square overflow-hidden" data-reveal-item>
                  <DpmProductImage src={src} alt="Consultation sample" fill showDpmMark markSize="sm" imageClassName="object-contain p-2" sizes="15vw" />
                </div>
              ))}
            </div>
          </div>
          <div className="card-vibrant p-6" data-reveal data-reveal-delay="0.15">
            <BookingForm methods={settings.booking?.methods} />
          </div>
        </Container>
      </VibrantSection>
    </>
  );
}
