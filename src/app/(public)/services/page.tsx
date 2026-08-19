import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
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

      <section className="py-20">
        <Container>
          {services.length === 0 ? (
            <EmptyState
              title="Services coming soon"
              description="Our service catalog will appear here once connected to the database."
              actionLabel="Contact us"
              actionHref="/contact"
            />
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {services.map((service) => (
                <Link
                  key={String(service._id)}
                  href={`/services/${service.slug}`}
                  className="group grid overflow-hidden rounded-sm border border-chrome-light/60 md:grid-cols-5 transition-all hover:border-royal-blue hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] bg-chrome-light/20 md:col-span-2 md:aspect-auto">
                    {service.cardImage?.url && (
                      <Image
                        src={service.cardImage.url}
                        alt={service.title}
                        fill
                        className="object-contain p-4 transition-transform group-hover:scale-105"
                        sizes="40vw"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-6 md:col-span-3">
                    <h2 className="font-display text-xl font-semibold group-hover:text-royal-blue">{service.title}</h2>
                    <p className="mt-2 text-sm text-carbon">{service.shortDescription}</p>
                    <span className="mt-4 text-sm font-semibold text-royal-blue">Learn more →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
