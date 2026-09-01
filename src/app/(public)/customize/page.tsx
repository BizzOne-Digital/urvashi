import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaBanner } from "@/components/ui/PageCtaBanner";
import { CustomizeUploadForm } from "@/components/customize/CustomizeUploadForm";
import { getCachedSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Customize",
  description: "Upload your picture and details — we'll contact you about your custom print order.",
};

export default async function CustomizePage() {
  const settings = await getCachedSettings();

  return (
    <>
      <PageHero
        eyebrow="Custom orders"
        title="Send us your design"
        subtitle="Upload your picture, add your name, email, and phone — we'll review it and get back to you with pricing and next steps."
        image="/home/customizer-preview.jpg"
      />

      <HighlightStrip />

      <VibrantSection variant="mesh" reveal={false}>
        <Container className="max-w-2xl">
          <SectionHeader
            eyebrow="Quick request"
            title="Upload & submit"
            subtitle="No product picker needed. Share your artwork and contact details and our team will follow up by email or phone."
            className="mb-8"
          />

          <div className="rounded-xl border border-white/10 bg-[#050508] p-5 shadow-[0_0_40px_rgba(6,94,229,0.12)] sm:p-8">
            <CustomizeUploadForm
              rightsConfirmationCopy={settings.customization?.rightsConfirmationCopy}
            />
          </div>

          <p className="mt-6 text-center text-sm text-chrome-mid">
            Prefer to browse products first?{" "}
            <Link href="/shop" className="font-semibold text-cyan hover:underline">Visit the shop</Link>
            {" "}or{" "}
            <Link href="/contact" className="font-semibold text-cyan hover:underline">contact us</Link>
            {" "}for questions.
          </p>
        </Container>
      </VibrantSection>

      <PageCtaBanner
        title="Need a quote for bulk or apparel?"
        description="We can help with mugs, tumblers, pens, gifts, and larger custom runs."
        primaryHref="/contact"
        primaryLabel="Contact us"
        secondaryHref="/pricing"
        secondaryLabel="View pricing"
      />
    </>
  );
}
