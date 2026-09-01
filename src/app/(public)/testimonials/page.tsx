import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { StatsBar } from "@/components/ui/StatsBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaBanner } from "@/components/ui/PageCtaBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublishedTestimonials } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Read what customers say about DPM Custom Prints.",
};

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < (rating || 0) ? "text-yellow" : "text-chrome-mid"}>★</span>
      ))}
    </div>
  );
}

export default async function TestimonialsPage() {
  const testimonials = await getPublishedTestimonials();

  return (
    <>
      <PageHero
        eyebrow="Reviews"
        title="Customer stories"
        subtitle="Real feedback from people who printed mugs, tumblers, pens, and gifts with DPM Custom Prints."
        image="/home/process/product-mockup.png"
      />

      <HighlightStrip />

      <VibrantSection variant="cosmic">
        <Container>
          <StatsBar className="mb-14" />
          <SectionHeader
            align="center"
            eyebrow="What people say"
            title="Printed with care"
            subtitle="Every order — from a single mug to a bulk pen run — gets the same attention to colour, placement, and communication."
          />
        </Container>
      </VibrantSection>

      <VibrantSection variant="mesh">
        <Container>
          {testimonials.length === 0 ? (
            <EmptyState
              title="No testimonials yet"
              description="Customer reviews will appear here once published."
              actionLabel="Contact us"
              actionHref="/contact"
            />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
              {testimonials.map((t) => (
                <article key={String(t._id)} className="card-vibrant p-6" data-reveal-item>
                  {t.image?.url && (
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-[#0a0c14]">
                      <Image
                        src={t.image.url}
                        alt={t.customerName}
                        fill
                        className="object-contain p-4"
                        sizes="33vw"
                      />
                    </div>
                  )}
                  <StarRating rating={t.rating} />
                  <blockquote className="mt-4 leading-relaxed text-chrome-light">
                    &ldquo;{t.testimonial}&rdquo;
                  </blockquote>
                  <footer className="mt-4 border-t border-white/10 pt-4">
                    <p className="font-semibold text-pure-paper">{t.customerName}</p>
                    {(t.title || t.location) && (
                      <p className="text-sm text-chrome-mid">
                        {[t.title, t.location].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </Container>
      </VibrantSection>

      <PageCtaBanner
        title="Ready to create your own story?"
        description="Start with the customizer or browse products with confirmed starting prices."
        primaryHref="/customize"
        primaryLabel="Start customizing"
        secondaryHref="/shop"
        secondaryLabel="Browse shop"
      />
    </>
  );
}
