import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCachedSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your custom print order. Manual invoice flow — pay after we confirm final pricing.",
};

export default async function CheckoutPage() {
  const settings = await getCachedSettings();

  return (
    <>
      <PageHero
        title="Checkout"
        subtitle="Place your order — we will send a manual invoice with final pricing before payment is required."
      />
      <section className="py-12">
        <Container>
          <CheckoutForm manualInvoiceInstructions={settings.commerce?.manualInvoiceInstructions} />
        </Container>
      </section>
    </>
  );
}
