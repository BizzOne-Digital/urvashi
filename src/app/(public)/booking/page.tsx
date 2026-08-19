import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { BookingForm } from "@/components/forms/BookingForm";
import { getCachedSettings } from "@/lib/settings";
import { DEMO_IMAGES } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description: "Request a consultation with DPM Custom Prints for custom orders, design review, or large projects.",
};

export default async function BookingPage() {
  const settings = await getCachedSettings();

  return (
    <>
      <PageHero
        eyebrow="Consultation"
        title="Book a consultation"
        subtitle="Share your project details and preferred times. This is a request — not a confirmed appointment."
        image="/demo/ink-lab.svg"
      />

      <section className="py-16">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold">How it works</h2>
            <ol className="mt-6 space-y-4 text-sm text-carbon">
              <li className="flex gap-3"><span className="font-bold text-royal-blue">1.</span> Submit your consultation request with project details.</li>
              <li className="flex gap-3"><span className="font-bold text-royal-blue">2.</span> We review your request and contact you to confirm availability.</li>
              <li className="flex gap-3"><span className="font-bold text-royal-blue">3.</span> We discuss options, pricing, and next steps for your order.</li>
            </ol>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {DEMO_IMAGES.slice(0, 6).map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-sm border border-chrome-light/60">
                  <Image src={src} alt="Consultation sample" fill className="object-contain p-2" sizes="15vw" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-sm border border-chrome-light/60 bg-chrome-light/5 p-6">
            <BookingForm methods={settings.booking?.methods} />
          </div>
        </Container>
      </section>
    </>
  );
}
