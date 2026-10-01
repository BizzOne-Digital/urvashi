import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Design payment confirmed",
  description: "Your DPM design service payment was received.",
};

interface Props {
  searchParams: Promise<{ ref?: string }>;
}

export default async function CustomizeSuccessPage({ searchParams }: Props) {
  const { ref } = await searchParams;

  return (
    <section className="py-20">
      <Container className="max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cyan/20 text-2xl text-cyan">
          ✓
        </div>
        <h1 className="heading-section text-pure-paper">
          {ref ? "Payment received" : "Thank you"}
        </h1>
        <p className="mt-4 text-chrome-light">
          {ref ? (
            <>
              Thank you! Your request <strong>{ref}</strong> is confirmed.
            </>
          ) : (
            <>
              If you just completed payment, your confirmation is on its way by email. You can also return here from
              the payment screen with your reference number in the link.
            </>
          )}
        </p>
        <p className="mt-4 text-sm text-chrome-mid">
          Payment received! We will review your images and email you 2–3 design options shortly.
        </p>
        <p className="mt-6 text-sm text-chrome-light">
          We will review your uploaded images and email you 2–3 design options. You can reply with your favourite
          choice to move forward with your order.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/shop" className={buttonVariants("primary")}>Browse products</Link>
          <Link href="/contact" className={buttonVariants("secondary")}>Contact us</Link>
        </div>
      </Container>
    </section>
  );
}
