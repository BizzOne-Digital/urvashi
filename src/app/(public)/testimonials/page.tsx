import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
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
        <span key={i} className={i < (rating || 0) ? "text-yellow" : "text-chrome-light"}>★</span>
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
        subtitle="Real feedback from people who printed with DPM Custom Prints."
        image="/demo/ink-lab.svg"
      />

      <section className="py-16">
        <Container>
          {testimonials.length === 0 ? (
            <EmptyState title="No testimonials yet" description="Customer reviews will appear here once published." />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <article key={String(t._id)} className="rounded-sm border border-chrome-light/60 bg-pure-paper p-6 shadow-sm">
                  {t.image?.url && (
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-sm bg-chrome-light/20">
                      <Image src={t.image.url} alt={t.customerName} fill className="object-contain p-4" sizes="33vw" />
                    </div>
                  )}
                  <StarRating rating={t.rating} />
                  <blockquote className="mt-4 text-carbon leading-relaxed">&ldquo;{t.testimonial}&rdquo;</blockquote>
                  <footer className="mt-4 border-t border-chrome-light/40 pt-4">
                    <p className="font-semibold">{t.customerName}</p>
                    {(t.title || t.location) && (
                      <p className="text-sm text-chrome-mid">{[t.title, t.location].filter(Boolean).join(" · ")}</p>
                    )}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
