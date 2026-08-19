import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CinematicIntro } from "@/components/home/CinematicIntro";
import { HomeHero } from "@/components/home/HomeHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { getCachedSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/brand";
import {
  DEMO_IMAGES,
  getFeaturedProducts,
  getPublishedServices,
  getPublishedTestimonials,
  getPublishedFaqs,
  getGalleryItems,
  getProductCategories,
} from "@/lib/public-data";
import { getProductPriceDisplay } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings();
  return {
    title: settings.general?.defaultSeoTitle || siteDefaults.headline,
    description: settings.general?.defaultSeoDescription || siteDefaults.tagline,
  };
}

export default async function HomePage() {
  const [settings, featuredProducts, services, testimonials, faqs, galleryItems, categories] =
    await Promise.all([
      getCachedSettings(),
      getFeaturedProducts(8),
      getPublishedServices(),
      getPublishedTestimonials(true),
      getPublishedFaqs(),
      getGalleryItems(),
      getProductCategories(),
    ]);

  const introEnabled = settings.motion?.introEnabled !== false;
  const logoPath = settings.general?.logoPath || siteDefaults.logoPath;
  const shortName = settings.general?.shortName || siteDefaults.shortName;
  const tagline = settings.general?.tagline || siteDefaults.tagline;

  const galleryStrip = galleryItems.slice(0, 8);
  const faqPreview = faqs.slice(0, 4);
  const testimonialPreview = testimonials.slice(0, 3);

  return (
    <>
      <CinematicIntro logoPath={logoPath} shortName={shortName} enabled={introEnabled} />

      <HomeHero tagline={tagline} />

      {/* Category rail */}
      <section className="overflow-hidden border-b border-chrome-light/40 py-12">
        <Container className="min-w-0">
          <h2 className="heading-section">Shop by category</h2>
          <div className="-mx-4 mt-8 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {(categories.length > 0 ? categories : [
              { _id: "drinkware", name: "Drinkware", slug: "drinkware", image: "/demo/mug-white.svg" },
              { _id: "apparel", name: "Apparel", slug: "apparel", image: "/demo/tshirt.svg" },
              { _id: "gifts", name: "Gifts", slug: "gifts-keepsakes", image: "/demo/ornament.svg" },
              { _id: "seasonal", name: "Seasonal", slug: "seasonal", image: "/demo/calendar.svg" },
            ]).map((cat, i) => (
              <Link
                key={String(cat._id)}
                href={`/shop?category=${cat.slug}`}
                className="group flex min-w-[140px] flex-col items-center gap-3 rounded-sm border border-chrome-light/60 p-4 transition-all hover:border-royal-blue hover:shadow-md"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-chrome-light/20">
                  <Image
                    src={(cat as { image?: string }).image || DEMO_IMAGES[i % DEMO_IMAGES.length]}
                    alt={cat.name}
                    fill
                    className="object-contain p-2 transition-transform group-hover:scale-110"
                    sizes="80px"
                  />
                </div>
                <span className="text-sm font-semibold">{cat.name}</span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Scroll story */}
      <section className="section-dark overflow-hidden py-20">
        <Container className="grid min-w-0 items-center gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan">The process</p>
            <h2 className="heading-section mt-3">From idea to object</h2>
            <p className="mt-4 text-chrome-light">
              Share your artwork or text, review your preview, and we handle production with care. Every print passes through our ink lab workflow.
            </p>
            <ol className="mt-8 space-y-6">
              {["Share your idea", "Review & confirm", "Print & deliver"].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-royal-blue font-bold">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{step}</p>
                    <p className="text-sm text-chrome-light">
                      {i === 0 && "Upload artwork or describe your vision."}
                      {i === 1 && "We confirm pricing, placement, and timeline."}
                      {i === 2 && "Your order is produced and ready for pickup or shipping."}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {DEMO_IMAGES.slice(2, 6).map((src) => (
              <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-sm border border-chrome-mid/30">
                <Image src={src} alt="Print process visual" fill className="object-contain p-4 bg-carbon" sizes="25vw" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <section className="overflow-hidden py-20">
        <Container className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-end justify-between gap-4">
            <h2 className="heading-section">Featured products</h2>
            <Link href="/shop" className="text-sm font-semibold text-royal-blue hover:underline">View all</Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={featuredProducts.map((p) => ({ ...p, _id: String(p._id) }))} emptyDescription="Featured products will appear here once the catalog is loaded." />
          </div>
        </Container>
      </section>

      {/* CMYK section */}
      <section className="border-y border-chrome-light/40 bg-gradient-to-br from-deep-blue to-ink-black py-16 text-pure-paper">
        <Container className="text-center">
          <h2 className="heading-section">CMYK precision</h2>
          <p className="mx-auto mt-4 max-w-2xl text-chrome-light">
            Cyan, magenta, yellow, and black — the foundation of every vibrant custom print we produce.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {[
              { label: "Cyan", color: "bg-cyan" },
              { label: "Magenta", color: "bg-magenta" },
              { label: "Yellow", color: "bg-yellow" },
              { label: "Black", color: "bg-ink-black border border-chrome-mid" },
            ].map((c) => (
              <div key={c.label} className="flex flex-col items-center gap-2">
                <div className={cn("h-16 w-16 rounded-full shadow-lg", c.color)} />
                <span className="text-xs font-semibold uppercase tracking-wider">{c.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Service cards */}
      <section className="py-20">
        <Container>
          <h2 className="heading-section">What we print</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(services.length > 0 ? services.slice(0, 6) : []).map((service) => (
              <Link
                key={String(service._id)}
                href={`/services/${service.slug}`}
                className="group overflow-hidden rounded-sm border border-chrome-light/60 transition-all hover:border-royal-blue hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] bg-chrome-light/20">
                  {service.cardImage?.url && (
                    <Image src={service.cardImage.url} alt={service.title} fill className="object-contain p-6 transition-transform group-hover:scale-105" sizes="33vw" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold group-hover:text-royal-blue">{service.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-carbon">{service.shortDescription}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/services" className={buttonVariants("secondary")}>All services</Link>
          </div>
        </Container>
      </section>

      {/* Customizer preview */}
      <section className="section-dark overflow-hidden py-20">
        <Container className="grid min-w-0 items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-sm border border-chrome-mid/30">
            <Image src="/demo/mug-white.svg" alt="Customizer preview" fill className="object-contain p-8 bg-carbon" sizes="50vw" />
          </div>
          <div>
            <h2 className="heading-section">Design it your way</h2>
            <p className="mt-4 text-chrome-light">Use our customizer to preview text, colours, and artwork on select products before you order.</p>
            <Link href="/customize" className={cn(buttonVariants("primary"), "mt-8 inline-flex")}>Open customizer</Link>
          </div>
        </Container>
      </section>

      {/* Pricing highlights */}
      <section className="py-20">
        <Container>
          <h2 className="heading-section">Starting prices</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(featuredProducts.length > 0 ? featuredProducts.slice(0, 4) : []).map((p) => {
              const { display } = getProductPriceDisplay(p, p.currency);
              return (
                <div key={String(p._id)} className="rounded-sm border border-chrome-light/60 p-5">
                  <p className="font-semibold">{p.name}</p>
                  <p className="mt-2 text-2xl font-bold text-royal-blue">{display}</p>
                </div>
              );
            })}
          </div>
          <Link href="/shop" className="mt-8 inline-block text-sm font-semibold text-royal-blue hover:underline">View all products →</Link>
        </Container>
      </section>

      {/* Gallery strip */}
      <section className="overflow-hidden border-t border-chrome-light/40 py-16">
        <Container className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-end justify-between gap-4">
            <h2 className="heading-section">Recent work</h2>
            <Link href="/gallery" className="text-sm font-semibold text-royal-blue hover:underline">View gallery</Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
            {(galleryStrip.length > 0 ? galleryStrip : DEMO_IMAGES.map((url, i) => ({ _id: String(i), publicUrl: url, alt: `Gallery ${i}` }))).map((item, i) => (
              <div key={String(item._id || i)} className="relative aspect-square overflow-hidden rounded-sm bg-chrome-light/20">
                <Image
                  src={(item as { publicUrl?: string }).publicUrl || (item as { url?: string }).url || DEMO_IMAGES[i % DEMO_IMAGES.length]}
                  alt={(item as { alt?: string }).alt || "Gallery image"}
                  fill
                  className="object-contain p-2"
                  sizes="12vw"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Quality section */}
      <section className="section-dark overflow-hidden py-20">
        <Container className="grid min-w-0 items-center gap-12 lg:grid-cols-2">
          <div className="min-w-0 pt-8 sm:pt-10 lg:pt-14">
            <h2 className="heading-section">Quality you can feel</h2>
            <p className="mt-4 text-chrome-light">We treat every order — from a single mug to a bulk pen run — with the same attention to colour, placement, and durability.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {DEMO_IMAGES.slice(5, 9).map((src) => (
              <div key={src} className="relative aspect-square rounded-sm border border-chrome-mid/30">
                <Image src={src} alt="Quality print sample" fill className="object-contain p-3" sizes="25vw" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Gifts section */}
      <section className="overflow-hidden py-20">
        <Container className="grid min-w-0 items-center gap-12 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            {["/demo/ornament.svg", "/demo/keychain.svg", "/demo/magnet.svg", "/demo/calendar.svg"].map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-sm border border-chrome-light/60">
                <Image src={src} alt="Gift product" fill className="object-contain p-4" sizes="25vw" />
              </div>
            ))}
          </div>
          <div>
            <h2 className="heading-section">Meaningful gifts</h2>
            <p className="mt-4 text-carbon">Ornaments, key chains, magnets, and calendars — personalized keepsakes for every occasion.</p>
            <Link href="/shop?category=gifts-keepsakes" className={cn(buttonVariants("primary"), "mt-8 inline-flex")}>Shop gifts</Link>
          </div>
        </Container>
      </section>

      {/* Testimonials preview */}
      {testimonialPreview.length > 0 && (
        <section className="border-t border-chrome-light/40 bg-chrome-light/10 py-20">
          <Container className="mx-auto max-w-5xl text-center">
            <h2 className="heading-section">Customer stories</h2>
            <p className="mx-auto mt-3 max-w-2xl text-chrome-mid">
              Hear from people who turned their ideas into printed keepsakes, gifts, and everyday products.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              {testimonialPreview.map((t) => (
                <blockquote
                  key={String(t._id)}
                  className="w-full max-w-md rounded-sm border border-chrome-light/60 bg-pure-paper p-6 text-left"
                >
                  <p className="text-sm leading-relaxed text-carbon">&ldquo;{t.testimonial}&rdquo;</p>
                  <footer className="mt-4 text-sm font-semibold">
                    {t.customerName}
                    {t.location && <span className="font-normal text-chrome-mid"> · {t.location}</span>}
                  </footer>
                </blockquote>
              ))}
            </div>
            <Link href="/testimonials" className="mt-8 inline-block text-sm font-semibold text-royal-blue hover:underline">
              All testimonials →
            </Link>
          </Container>
        </section>
      )}

      {/* FAQ preview */}
      {faqPreview.length > 0 && (
        <section className="py-20">
          <Container>
            <h2 className="heading-section">Questions answered</h2>
            <dl className="mt-10 space-y-6">
              {faqPreview.map((faq) => (
                <div key={String(faq._id)} className="border-b border-chrome-light/60 pb-6">
                  <dt className="font-semibold">{faq.question}</dt>
                  <dd className="mt-2 text-sm text-carbon">{faq.answer}</dd>
                </div>
              ))}
            </dl>
            <Link href="/faqs" className="mt-8 inline-block text-sm font-semibold text-royal-blue hover:underline">All FAQs →</Link>
          </Container>
        </section>
      )}

      {/* Contact / newsletter */}
      <section className="section-dark overflow-hidden py-20">
        <Container className="grid min-w-0 items-center gap-12 lg:grid-cols-2">
          <div className="min-w-0 pt-8 sm:pt-10 lg:pt-14">
            <h2 className="heading-section">Ready to start?</h2>
            <p className="mt-4 break-words text-chrome-light">Tell us about your project. We typically respond within one business day.</p>
            <div className="mt-8 space-y-2 break-words text-sm text-chrome-light">
              <p className="break-all">Email: {settings.contact?.email || siteDefaults.email}</p>
              <p>Phone: {settings.contact?.phone || siteDefaults.phone}</p>
            </div>
          </div>
          <div className="min-w-0 rounded-sm border border-chrome-mid/40 bg-carbon p-4 sm:p-6">
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
