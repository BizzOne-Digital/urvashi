import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { CustomizerStudio } from "@/components/customize/CustomizerStudio";
import { getCachedSettings } from "@/lib/settings";
import { getCustomizerProducts } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Customize",
  description: "Design your custom print with text, colours, fonts, and artwork upload.",
};

export default async function CustomizePage() {
  const [settings, products] = await Promise.all([getCachedSettings(), getCustomizerProducts()]);

  return (
    <>
      <PageHero
        eyebrow="Design studio"
        title="Customize your print"
        subtitle="Select a product, add your text and artwork, and preview before you order."
        image="/demo/mug-white.svg"
      />

      <VibrantSection variant="mesh" reveal={false}>
        <Container className="flex justify-center">
          <div className="card-vibrant w-full max-w-lg p-4 sm:p-6" data-reveal>
            <CustomizerStudio
            products={products.map((p) => ({ ...p, _id: String(p._id) }))}
            previewDisclaimer={settings.customization?.previewDisclaimer}
            rightsConfirmationCopy={settings.customization?.rightsConfirmationCopy}
            />
          </div>
        </Container>
      </VibrantSection>
    </>
  );
}
