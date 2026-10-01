import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { CartClient } from "@/components/cart/CartClient";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your custom print order before checkout.",
};

export default function CartPage() {
  return (
    <>
      <PageHero title="Your cart" subtitle="Review items and proceed to checkout when ready." />
      <VibrantSection variant="mesh">
        <Container>
          <div data-reveal>
            <CartClient />
          </div>
        </Container>
      </VibrantSection>
    </>
  );
}
