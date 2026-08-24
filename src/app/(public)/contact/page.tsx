import type { Metadata } from "next";
import Link from "next/link";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
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
          image: "/demo/ink-lab.svg",
        }}
      />

      <VibrantSection variant="mesh">
        <Container className="min-w-0">
          <div className="grid min-w-0 gap-12 lg:grid-cols-2">
            <div className="min-w-0" data-reveal>
              <h2 className="font-display text-xl font-bold sm:text-2xl">Reach us directly</h2>
              <ul className="mt-6 space-y-4 break-words text-carbon">
                <li className="card-vibrant p-4">
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${settings.contact?.email || siteDefaults.email}`} className="break-all text-royal-blue hover:underline">
                    {settings.contact?.email || siteDefaults.email}
                  </a>
                </li>
                <li className="card-vibrant p-4">
                  <strong>Phone:</strong>{" "}
                  <a href={settings.contact?.phoneLink || siteDefaults.phoneLink} className="text-royal-blue hover:underline">
                    {settings.contact?.phone || siteDefaults.phone}
                  </a>
                </li>
                {settings.contact?.whatsappLink && (
                  <li className="card-vibrant p-4">
                    <strong>WhatsApp:</strong>{" "}
                    <a href={settings.contact.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-royal-blue hover:underline">
                      Message us
                    </a>
                  </li>
                )}
              </ul>
              <p className="mt-6 text-sm text-chrome-mid">
                Prefer a scheduled call? <Link href="/booking" className="font-semibold text-royal-blue hover:underline">Book a consultation</Link>.
              </p>
            </div>
            <div className="card-vibrant min-w-0 p-4 sm:p-6" data-reveal data-reveal-delay="0.15">
              <ContactForm serviceOptions={serviceOptions} />
            </div>
          </div>
        </Container>
      </VibrantSection>
    </>
  );
}
