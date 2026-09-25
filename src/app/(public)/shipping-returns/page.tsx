import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { ContentPanel } from "@/components/ui/ContentPanel";
import { PageCtaBanner } from "@/components/ui/PageCtaBanner";
import { buttonVariants } from "@/components/ui/Button";
import { getCachedSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Shipping, pickup, and return information for DPM Custom Prints orders.",
};

export default async function ShippingReturnsPage() {
  const settings = await getCachedSettings();
  const returnNotes = settings.commerce?.returnNotes;
  const email = settings.contact?.email || siteDefaults.email;
  const phone = settings.contact?.phone || siteDefaults.phone;

  return (
    <>
      <PageHero
        title="Shipping & Returns"
        subtitle="How we handle fulfillment, shipping, taxes, and returns on custom printed orders."
      />

      <HighlightStrip />

      <VibrantSection variant="mesh">
        <Container className="max-w-3xl">
          <ContentPanel>
            <h2>Shipping</h2>
            <p>
              At checkout, enter your shipping address to see Canada Post Standard and Express options with tracking.
              Shipping and applicable provincial taxes are calculated automatically before you place your order.
            </p>

            <h2>Pickup</h2>
            <p>
              {settings.commerce?.pickupEnabled
                ? "Local pickup may be available — we will confirm details when your order is ready."
                : "Contact us to discuss pickup options for your order in the Ottawa area."}
            </p>

            <h2>Returns & exchanges</h2>
            <p>
              {returnNotes ||
                "Because most items are custom printed, returns and exchanges are handled on a case-by-case basis. Contact us before sending any items back."}
            </p>

            <h2>Custom orders</h2>
            <p>
              Custom and personalized items may not be eligible for return unless there is a production defect. We
              review artwork and order details with you before production to reduce surprises.
            </p>

            <h2>Questions?</h2>
            <p>
              Reach us at <a href={`mailto:${email}`}>{email}</a> or{" "}
              <a href={siteDefaults.phoneLink}>{phone}</a> before shipping anything back or if you need help with
              delivery options.
            </p>
          </ContentPanel>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/checkout" className={buttonVariants("primary")}>
              Go to checkout
            </Link>
            <Link href="/faqs" className={buttonVariants("secondary")}>
              Read FAQs
            </Link>
          </div>
        </Container>
      </VibrantSection>

      <PageCtaBanner
        title="Need help before you order?"
        description="We're happy to walk through shipping, pickup, or return questions."
        primaryHref="/contact"
        primaryLabel="Contact us"
        secondaryHref="/shop"
        secondaryLabel="Browse shop"
      />
    </>
  );
}
