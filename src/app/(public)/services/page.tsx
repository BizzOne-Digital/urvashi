import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublishedServices } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Services",
  description: "Custom printing services — drinkware, apparel, gifts, promotional products, and seasonal printing.",
};

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Custom printing services"
        subtitle="From drinkware and apparel to gifts, promotional items, and seasonal keepsakes."
        image="/demo/ink-lab.svg"
      />

      <VibrantSection variant="mesh">
        <Container>
          {services.length === 0 ? (
            <EmptyState
              title="Services coming soon"
              description="Our service catalog will appear here once connected to the database."
              actionLabel="Contact us"
              actionHref="/contact"
            />
          ) : (
            <div className="grid gap-8 md:grid-cols-2" data-reveal-stagger>
              {services.map((service) => (
                <Link
                  key={String(service._id)}
                  href={`/services/${service.slug}`}
                  className="group card-vibrant grid overflow-hidden md:grid-cols-5"
                  data-reveal-item
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-chrome-light/30 to-pure-paper md:col-span-2 md:aspect-auto">
                    {service.cardImage?.url && (
                      <Image
                        src={service.cardImage.url}
                        alt={service.title}
                        fill
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                        sizes="40vw"
                      />
                    )}
                    <span className="absolute bottom-2 right-2 font-display text-sm font-bold italic text-royal-blue/80">DPM</span>
                  </div>
                  <div className="flex flex-col justify-center p-6 md:col-span-3">
                    <h2 className="font-display text-xl font-semibold transition-colors group-hover:text-royal-blue">{service.title}</h2>
                    <p className="mt-2 text-sm text-carbon">{service.shortDescription}</p>
                    <span className="mt-4 text-sm font-semibold text-cyan">Learn more →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </VibrantSection>
    </>
  );
}
