import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { FaqAccordion } from "@/components/faqs/FaqAccordion";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublishedFaqs } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about ordering, pricing, artwork, and custom printing at DPM.",
};

export default async function FaqsPage() {
  const faqs = await getPublishedFaqs();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        subtitle="Ordering, pricing, artwork, minimum quantities, and more."
        image="/demo/calendar.svg"
      />

      <VibrantSection variant="mesh">
        <Container className="max-w-3xl">
          {faqs.length === 0 ? (
            <EmptyState title="No FAQs yet" description="Common questions will appear here once published." actionLabel="Contact us" actionHref="/contact" />
          ) : (
            <FaqAccordion faqs={faqs} />
          )}
        </Container>
      </VibrantSection>
    </>
  );
}
