import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaBanner } from "@/components/ui/PageCtaBanner";
import { ContactForm } from "@/components/forms/ContactForm";
import { getCachedSettings } from "@/lib/settings";
import { getPublishedPageBySlug, getPublishedServices } from "@/lib/public-data";
import { getPageSection, pageMetadata } from "@/lib/page-content";
import { siteDefaults } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug("contact");
  return pageMetadata(page, {
    title: "Contact",
    description: "Contact DPM Custom Prints for custom orders, quotes, artwork help, and general inquiries.",
  });
}

export default async function ContactPage() {
  const [settings, services, page] = await Promise.all([
    getCachedSettings(),
    getPublishedServices(),
    getPublishedPageBySlug("contact"),
  ]);
  const serviceOptions = services.length > 0 ? services.map((s) => s.title) : ["Custom printing"];
  const hero = getPageSection(page, "hero");

  return (
    <>
      <CmsPageHero
        section={hero}
        fallback={{
          eyebrow: "Get in touch",
          title: "Contact us",
          subtitle: "Questions about a product, custom order, or artwork? We're here to help.",
        }}
      />

      <HighlightStrip />

      <VibrantSection variant="mesh">
        <Container className="min-w-0">
          <div className="grid min-w-0 gap-12 lg:grid-cols-2">
            <div className="min-w-0" data-reveal>
              <SectionHeader
                eyebrow="Direct line"
                title="Reach us directly"
                subtitle="Email, phone, or WhatsApp — we respond quickly and walk you through every step."
              />

              <ul className="mt-8 space-y-4 break-words text-chrome-light">
                <li className="card-vibrant p-5">
                  <strong className="text-pure-paper">Email</strong>
                  <a
                    href={`mailto:${settings.contact?.email || siteDefaults.email}`}
                    className="mt-1 block break-all text-cyan hover:underline"
                  >
                    {settings.contact?.email || siteDefaults.email}
                  </a>
                </li>
                <li className="card-vibrant p-5">
                  <strong className="text-pure-paper">Phone</strong>
                  <a
                    href={settings.contact?.phoneLink || siteDefaults.phoneLink}
                    className="mt-1 block text-cyan hover:underline"
                  >
                    {settings.contact?.phone || siteDefaults.phone}
                  </a>
                </li>
                {settings.contact?.whatsappLink && (
                  <li className="card-vibrant p-5">
                    <strong className="text-pure-paper">WhatsApp</strong>
                    <a
                      href={settings.contact.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-cyan hover:underline"
                    >
                      Message us on WhatsApp
                    </a>
                  </li>
                )}
              </ul>

              <div className="mt-8 grid grid-cols-3 gap-3" data-reveal-stagger>
                {[
                  "/products/sublimation-mug/customized.png",
                  "/products/tumblers/customized.png",
                  "/products/sublimation-pens/customized.png",
                ].map((src) => (
                  <div key={src} className="card-vibrant relative aspect-square overflow-hidden" data-reveal-item>
                    <Image src={src} alt="" fill className="object-contain p-2" sizes="15vw" />
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-chrome-light">
                Prefer a scheduled call?{" "}
                <Link href="/booking" className="font-semibold text-cyan hover:underline">
                  Book a consultation
                </Link>
                .
              </p>
            </div>

            <div
              className="rounded-xl border border-white/10 bg-[#050508] p-4 shadow-[0_0_40px_rgba(6,94,229,0.12)] sm:p-6"
              data-reveal
              data-reveal-delay="0.15"
            >
              <h2 className="font-display text-xl font-bold text-pure-paper">Send a message</h2>
              <p className="mt-2 text-sm text-chrome-light">
                Tell us about your project and we&apos;ll get back to you soon.
              </p>
              <ContactForm serviceOptions={serviceOptions} className="mt-6" />
            </div>
          </div>
        </Container>
      </VibrantSection>

      <PageCtaBanner
        title="Want to see it before you order?"
        description="Use the live customizer to preview text, colours, and artwork on select products."
        primaryHref="/customize"
        primaryLabel="Open customizer"
        secondaryHref="/faqs"
        secondaryLabel="Read FAQs"
      />
    </>
  );
}
