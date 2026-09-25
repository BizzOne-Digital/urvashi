import type { Metadata } from "next";
import Link from "next/link";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaBanner } from "@/components/ui/PageCtaBanner";
import { FaqAccordion } from "@/components/faqs/FaqAccordion";
import { buttonVariants } from "@/components/ui/Button";
import { getPublishedFaqs, getPublishedPageBySlug } from "@/lib/public-data";
import { getPageSection, pageMetadata } from "@/lib/page-content";

const QUICK_LINKS = [
  { href: "/shop", label: "Shop products", desc: "Browse mugs, tumblers, pens & more" },
  { href: "/pricing", label: "View pricing", desc: "Confirmed CAD starting prices" },
  { href: "/shipping-returns", label: "Shipping info", desc: "Canada Post & returns policy" },
  { href: "/contact", label: "Contact us", desc: "Quotes, artwork & order help" },
];

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug("faqs");
  return pageMetadata(page, {
    title: "FAQs",
    description: "Frequently asked questions about ordering, pricing, artwork, and custom printing at DPM.",
  });
}

export default async function FaqsPage() {
  const [faqs, page] = await Promise.all([getPublishedFaqs(), getPublishedPageBySlug("faqs")]);
  const hero = getPageSection(page, "hero");

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

      <CmsPageHero
        section={hero}
        fallback={{
          eyebrow: "Help centre",
          title: "Frequently asked questions",
          subtitle: "Ordering, pricing, artwork, shipping, minimum quantities, and more.",
        }}
      />

      <HighlightStrip />

      <VibrantSection variant="cosmic">
        <Container>
          <SectionHeader
            eyebrow="Quick links"
            title="Find answers fast"
            subtitle="Jump to the section that matches your question, or search below."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="card-vibrant group block p-5 transition-all"
                data-reveal-item
              >
                <p className="font-semibold text-pure-paper group-hover:text-cyan">{link.label}</p>
                <p className="mt-1 text-sm text-chrome-mid group-hover:text-chrome-light">{link.desc}</p>
                <span className="mt-3 text-xs font-bold uppercase tracking-wide text-cyan">Go →</span>
              </Link>
            ))}
          </div>
        </Container>
      </VibrantSection>

      <VibrantSection variant="mesh">
        <Container className="max-w-3xl">
          <SectionHeader
            eyebrow="All questions"
            title={`${faqs.length} answers`}
            subtitle="Search or browse common questions about orders, artwork, and shipping."
            className="mb-10"
          />
          <FaqAccordion faqs={faqs} />

          <div className="mt-12 card-vibrant p-8 text-center" data-reveal>
            <p className="font-display text-xl font-semibold gradient-heading-light">Still have questions?</p>
            <p className="mt-2 text-sm text-chrome-light">
              We are happy to help with custom orders, artwork, and shipping.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className={buttonVariants("primary")}>
                Contact us
              </Link>
              <Link href="/booking" className={buttonVariants("secondary")}>
                Book a consultation
              </Link>
            </div>
          </div>
        </Container>
      </VibrantSection>

      <PageCtaBanner
        title="Ready to start printing?"
        description="Preview your design live, then add to cart or request a quote."
        primaryHref="/customize"
        primaryLabel="Open customizer"
        secondaryHref="/shop"
        secondaryLabel="Browse shop"
      />
    </>
  );
}
