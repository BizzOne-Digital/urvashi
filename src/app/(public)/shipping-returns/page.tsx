import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
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
      <PageHero title="Shipping & Returns" subtitle="How we handle fulfillment, shipping, and returns." />

      <section className="py-16">
        <Container className="max-w-3xl prose-dpm">
          <h2>Shipping</h2>
          <p>
            At checkout, enter your address to see Canada Post Standard and Express options with tracking.
            Shipping and applicable provincial taxes are calculated automatically before you place your order.
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
            Custom and personalized items may not be eligible for return unless there is a production defect. We
            review artwork and order details with you before production to reduce surprises.
          </p>

          <h2>Questions?</h2>
          <p>
            Reach us at{" "}
            <a href={`mailto:${email}`}>{email}</a> or <a href={siteDefaults.phoneLink}>{phone}</a> before
            shipping anything back or if you need help with delivery options.
          </p>
        </Container>
      </section>

      <section className="border-t border-white/10 bg-[#080a12] py-12">
        <Container className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-lg font-semibold text-pure-paper">Need help with your order?</p>
            <p className="mt-1 text-sm text-chrome-mid">
              We&apos;re happy to walk through shipping, pickup, or return questions before you place an order.
            </p>
          </div>
          <Link href="/contact" className={buttonVariants("primary")}>
            Contact us
          </Link>
        </Container>
      </section>
    </>
  );
}
