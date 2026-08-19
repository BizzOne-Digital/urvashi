import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/forms/ContactForm";
import { getCachedSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/brand";
export const metadata: Metadata = {
  title: "Contact",
  description: "Contact DPM Custom Prints for custom orders, quotes, artwork help, and general inquiries.",
};

export default async function ContactPage() {
  const settings = await getCachedSettings();

  return (
    <section className="overflow-hidden py-12 lg:py-16">
      <Container className="min-w-0">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-royal-blue">Get in touch</p>
          <h1 className="heading-section mt-2">Contact us</h1>
          <p className="mx-auto mt-3 max-w-2xl text-carbon">
            Questions about a product, custom order, or artwork? We&apos;re here to help.
          </p>
        </div>

        <div className="grid min-w-0 gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Reach us directly</h2>
            <ul className="mt-6 space-y-4 break-words text-carbon">
              <li>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${settings.contact?.email || siteDefaults.email}`} className="break-all text-royal-blue hover:underline">
                  {settings.contact?.email || siteDefaults.email}
                </a>
              </li>
              <li>
                <strong>Phone:</strong>{" "}
                <a href={settings.contact?.phoneLink || siteDefaults.phoneLink} className="text-royal-blue hover:underline">
                  {settings.contact?.phone || siteDefaults.phone}
                </a>
              </li>
              {settings.contact?.whatsappLink && (
                <li>
                  <strong>WhatsApp:</strong>{" "}
                  <a href={settings.contact.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-royal-blue hover:underline">
                    Message us
                  </a>
                </li>
              )}
            </ul>
            <p className="mt-6 text-sm text-chrome-mid">
              Prefer a scheduled call? <Link href="/booking" className="text-royal-blue hover:underline">Book a consultation</Link>.
            </p>
          </div>
          <div className="min-w-0 rounded-sm border border-chrome-light/60 p-4 sm:p-6">
            <ContactForm />
          </div>
        </div>
      </Container>
    </section>
  );
}