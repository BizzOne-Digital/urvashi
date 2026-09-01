import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaBanner } from "@/components/ui/PageCtaBanner";
import { CustomizerStudio } from "@/components/customize/CustomizerStudio";
import { getCachedSettings } from "@/lib/settings";
import { getCustomizerProducts } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Customize",
  description: "Design your custom print with text, colours, fonts, and artwork upload.",
};

const CUSTOMIZE_FEATURES = [
  { title: "Live preview", desc: "See text and artwork on the product before you order." },
  { title: "Colour & font", desc: "Pick from brand colours and font styles on supported items." },
  { title: "Artwork upload", desc: "Add PNG, JPEG, or PDF files where customization is enabled." },
  { title: "Add to cart", desc: "Confirmed-price items can go straight to checkout." },
];

export default async function CustomizePage() {
  const [settings, products] = await Promise.all([getCachedSettings(), getCustomizerProducts()]);

  return (
    <>
      <PageHero
        eyebrow="Design studio"
        title="Customize your print"
        subtitle="Select a product, add your text and artwork, and preview before you order."
        image="/home/customizer-preview.jpg"
      />

      <HighlightStrip />

      <VibrantSection variant="cosmic" className="!py-12">
        <Container>
          <SectionHeader
            align="center"
            eyebrow="Studio features"
            title="Design it your way"
            subtitle="Everything you need to personalize mugs, tumblers, pens, and more."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
            {CUSTOMIZE_FEATURES.map((feature) => (
              <div key={feature.title} className="card-vibrant p-5 text-center" data-reveal-item>
                <p className="font-display text-lg font-semibold text-cyan">{feature.title}</p>
                <p className="mt-2 text-sm text-chrome-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </VibrantSection>

      <VibrantSection variant="mesh" reveal={false}>
        <Container className="max-w-6xl py-4 sm:py-8">
          <CustomizerStudio
            products={products.map((p) => ({ ...p, _id: String(p._id) }))}
            previewDisclaimer={settings.customization?.previewDisclaimer}
            rightsConfirmationCopy={settings.customization?.rightsConfirmationCopy}
          />
        </Container>
      </VibrantSection>

      <PageCtaBanner
        title="Happy with your preview?"
        description="Add to cart or contact us for bulk and quote-only items."
        primaryHref="/cart"
        primaryLabel="View cart"
        secondaryHref="/contact"
        secondaryLabel="Request a quote"
      />
    </>
  );
}
