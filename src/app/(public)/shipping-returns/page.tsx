import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { getCachedSettings } from "@/lib/settings";
import { DEMO_IMAGES } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Shipping, pickup, and return information for DPM Custom Prints orders.",
};

export default async function ShippingReturnsPage() {
  const settings = await getCachedSettings();
  const returnNotes = settings.commerce?.returnNotes;

  return (
    <>
      <PageHero title="Shipping & Returns" subtitle="How we handle fulfillment, shipping, and returns." />

      <section className="py-16">
        <Container className="max-w-3xl prose-dpm">
          <h2>Shipping</h2>
          <p>
            Shipping costs and methods are confirmed on your invoice before payment. We coordinate pickup or delivery details based on your order size and location in the Ottawa area and beyond.
          </p>

          <h2>Pickup</h2>
          <p>
            {settings.commerce?.pickupEnabled
              ? "Local pickup may be available — we will confirm details when your order is ready."
              : "Contact us to discuss pickup options for your order."}
          </p>

          <h2>Returns & exchanges</h2>
          <p>
            {returnNotes ||
              "Because most items are custom printed, returns and exchanges are handled on a case-by-case basis. Contact us before sending any items back."}
          </p>

          <h2>Custom orders</h2>
          <p>
            Custom and personalized items may not be eligible for return unless there is a production defect. We review artwork and order details with you before production to reduce surprises.
          </p>
        </Container>
      </section>

      <section className="border-t border-chrome-light/40 py-12">
        <Container>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            {DEMO_IMAGES.map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-sm border border-chrome-light/60">
                <Image src={src} alt="Shipping sample product" fill className="object-contain p-2" sizes="15vw" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
