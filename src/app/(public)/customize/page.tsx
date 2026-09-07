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
import { getCustomizeBaseFee, getCustomizeDesignFee } from "@/lib/customize-submission";
import { getPublicMonerisMode } from "@/lib/moneris";

export const metadata: Metadata = {
  title: "Customize",
  description:
    "Upload your picture, pay for our design service if you want us to create options for you, or submit your own artwork for printing.",
};

interface Props {
  searchParams: Promise<{ cancelled?: string }>;
}

export default async function CustomizePage({ searchParams }: Props) {
  const settings = await getCachedSettings();
  const { cancelled } = await searchParams;
  const designFee = getCustomizeDesignFee();
  const baseFee = getCustomizeBaseFee();

  return (
    <>
      <PageHero
        eyebrow="Custom orders"
        title="Send us your design"
        subtitle="Upload your picture and contact details. Use your own artwork, or choose our design service — pay online and we will email you 2–3 custom options."
        image="/home/customizer-preview.jpg"
      />

      <HighlightStrip />

      <VibrantSection variant="mesh" reveal={false}>
        <Container className="max-w-2xl">
          <SectionHeader
            eyebrow="Quick request"
            title="Upload & submit"
            subtitle="Upload your images here. If you want DPM to design for you, check “I prefer your design”, pay the fee, and we will email options after reviewing your upload."
            className="mb-8"
          />

          {cancelled === "1" && (
            <p className="mb-6 rounded-lg border border-deep-magenta/40 bg-deep-magenta/10 px-4 py-3 text-sm text-pure-paper">
              Payment was cancelled. Your upload was not submitted — you can try again below.
            </p>
          )}

          <div className="rounded-xl border border-white/10 bg-[#050508] p-5 shadow-[0_0_40px_rgba(6,94,229,0.12)] sm:p-8">
            <CustomizeUploadForm
              baseFee={baseFee}
              designFee={designFee}
              monerisMode={getPublicMonerisMode()}
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
