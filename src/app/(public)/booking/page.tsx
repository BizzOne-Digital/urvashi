import type { Metadata } from "next";
import Image from "next/image";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { StepList } from "@/components/ui/StepList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaBanner } from "@/components/ui/PageCtaBanner";
import { BookingForm } from "@/components/forms/BookingForm";
import { getCachedSettings } from "@/lib/settings";
import { getPublishedPageBySlug } from "@/lib/public-data";
import { getPageSection, pageMetadata } from "@/lib/page-content";

const BOOKING_STEPS = [
  {
    title: "Share your project",
    description: "Tell us what you want printed, your quantity, timeline, and upload artwork if you have it.",
  },
  {
    title: "We reach out",
    description: "We review your request and contact you to confirm availability — this is not a confirmed appointment yet.",
  },
  {
    title: "Plan & price",
    description: "We discuss options, pricing, placement, and next steps so you know exactly what to expect.",
  },
];

const BOOKING_GALLERY = [
  { src: "/products/sublimation-mug/customized.png", alt: "Custom mug" },
  { src: "/products/tumblers/customized.png", alt: "Custom tumbler" },
  { src: "/products/sublimation-pens/customized.png", alt: "Custom pens" },
  { src: "/products/keychains/customized.png", alt: "Custom keychains" },
  { src: "/products/glass-tumblers/customized.png", alt: "Glass tumbler" },
  { src: "/products/sublimation-ornaments/customized.png", alt: "Custom ornament" },
] as const;

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
          image: "/home/process/design-tablet.png",
        }}
      />

      <HighlightStrip />

      <VibrantSection variant="mesh">
        <Container className="grid min-w-0 gap-12 lg:grid-cols-2">
          <div data-reveal>
            <SectionHeader
              eyebrow="How it works"
              title="Let's plan your print"
              subtitle="Perfect for bulk orders, apparel quotes, artwork review, or when you want to talk through options before ordering."
            />
            <StepList steps={BOOKING_STEPS} className="mt-8" />

            <div className="mt-10 grid grid-cols-3 gap-3" data-reveal-stagger>
              {BOOKING_GALLERY.map((item) => (
                <div
                  key={item.src}
                  className="card-vibrant relative aspect-square overflow-hidden"
                  data-reveal-item
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-contain p-2 transition-transform duration-500 hover:scale-105"
                    sizes="15vw"
                  />
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl border border-white/10 bg-[#050508] p-5 shadow-[0_0_40px_rgba(6,94,229,0.12)] sm:p-6"
            data-reveal
            data-reveal-delay="0.15"
          >
            <h2 className="font-display text-xl font-bold text-pure-paper">Request a call</h2>
            <p className="mt-2 text-sm text-chrome-light">
              Fill in your details and we&apos;ll get back to you to confirm timing.
            </p>
            <BookingForm methods={settings.booking?.methods} className="mt-6" />
          </div>
        </Container>
      </VibrantSection>

      <PageCtaBanner
        title="Prefer to start right away?"
        description="Open the customizer or browse products with confirmed starting prices."
        primaryHref="/customize"
        primaryLabel="Open customizer"
        secondaryHref="/shop"
        secondaryLabel="Browse shop"
      />
    </>
  );
}
