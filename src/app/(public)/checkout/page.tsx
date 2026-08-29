import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCachedSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your custom print order with automatic shipping and tax calculation.",
};

export default async function CheckoutPage() {
  const settings = await getCachedSettings();

  return (
    <>
      <PageHero
        title="Checkout"
        subtitle="Enter your address to see Canada Post shipping options and taxes — your total is calculated before you place your order."
      />
      <section className="py-12">
        <Container>
          <CheckoutForm pickupEnabled={settings.commerce?.pickupEnabled} />
        </Container>
      </section>
    </>
  );
}
