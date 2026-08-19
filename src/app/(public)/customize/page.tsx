import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
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

      <section className="py-16">
        <Container className="flex justify-center">
          <CustomizerStudio
            products={products.map((p) => ({ ...p, _id: String(p._id) }))}
            previewDisclaimer={settings.customization?.previewDisclaimer}
            rightsConfirmationCopy={settings.customization?.rightsConfirmationCopy}
          />
        </Container>
      </section>
    </>
  );
}
