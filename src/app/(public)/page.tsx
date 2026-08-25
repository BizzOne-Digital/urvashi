import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CinematicIntro } from "@/components/home/CinematicIntro";
import { HomeHero } from "@/components/home/HomeHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { getCachedSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/brand";
import {
  getFeaturedProducts,
  getPublishedPageBySlug,
  getPublishedServices,
  getPublishedTestimonials,
  getPublishedFaqs,
} from "@/lib/public-data";
import { cmsHeading } from "@/lib/page-content";
import { PRICING_CATALOG } from "@/lib/product-pricing";
import { cn, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings();
  return {
    title: settings.general?.defaultSeoTitle || siteDefaults.headline,
    description: settings.general?.defaultSeoDescription || siteDefaults.tagline,
  };
}

export default async function HomePage() {
  const [settings, featuredProducts, services, testimonials, faqs, cmsPage] =
    await Promise.all([
      getCachedSettings(),
      getFeaturedProducts(8),
      getPublishedServices(),
      getPublishedTestimonials(true),
      getPublishedFaqs(),
      getPublishedPageBySlug("home"),
    ]);

  const introEnabled = settings.motion?.introEnabled !== false;
  const logoPath = settings.general?.logoPath || siteDefaults.logoPath;
  const shortName = settings.general?.shortName || siteDefaults.shortName;
  const tagline = settings.general?.tagline || siteDefaults.tagline;

  const faqPreview = faqs.slice(0, 4);
  const testimonialPreview = testimonials.slice(0, 3);
  const serviceOptions = services.length > 0 ? services.map((s) => s.title) : ["Custom printing"];

  const showcaseProducts = featuredProducts.filter(
    (p) => p.cardImage?.url || p.blankImage?.url || p.customizedImage?.url
  );

  const processImages = [
    { src: "/home/process/keychains.png", alt: "Blank keychains for every style" },
    { src: "/home/process/glass-tumbler.png", alt: "Customize your glass tumbler" },
    { src: "/home/process/pens.png", alt: "Sublimation pens" },
    { src: "/home/process/tumbler.png", alt: "Add your ideas to a blank tumbler" },
  ];

  const qualitySamples = [
    { src: "/products/tumblers/customized.png", alt: "Customized sublimation tumbler" },
    { src: "/products/glass-tumblers/customized.png", alt: "Customized glass tumbler" },
    { src: "/products/sublimation-pens/customized.png", alt: "Customized sublimation pen" },
    { src: "/products/sublimation-keychains/customized.png", alt: "Customized sublimation keychain" },
  ];

  return (
    <>
      <CinematicIntro logoPath={logoPath} shortName={shortName} enabled={introEnabled} />

      <HomeHero tagline={tagline} />

      {/* Scroll story */}
      <VibrantSection variant="dark">
        <Container className="grid min-w-0 items-center gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan">The process</p>
            <h2 className="heading-section mt-3">{cmsHeading(cmsPage, "process", "From idea to object")}</h2>
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
            {processImages.map((item) => (
              <div
                key={item.src}
                className="relative aspect-[4/3] overflow-hidden rounded-sm border border-chrome-mid/30 bg-pure-paper"
              >
                <Image src={item.src} alt={item.alt} fill className="object-cover" sizes="25vw" />
              </div>
            ))}
          </div>
        </Container>
      </VibrantSection>

      {/* Featured products */}
      <VibrantSection variant="light">
        <Container className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-end justify-between gap-4">
            <h2 className="heading-section gradient-heading">{cmsHeading(cmsPage, "featured-products", "Featured products")}</h2>
            <Link href="/shop" className="text-sm font-semibold text-royal-blue hover:underline">View all</Link>
          </div>
          <div className="mt-10">
            <ProductGrid products={featuredProducts.map((p) => ({ ...p, _id: String(p._id) }))} emptyDescription="Featured products will appear here once the catalog is loaded." />
          </div>
        </Container>
      </VibrantSection>

      {/* CMYK section */}
      <VibrantSection variant="gradient" className="border-y border-chrome-mid/30">
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
      </VibrantSection>

      {/* What we print */}
      <VibrantSection variant="mesh">
        <Container>
          <h2 className="heading-section">{cmsHeading(cmsPage, "services", "What we print")}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-reveal-stagger>
            {showcaseProducts.map((product) => {
              const imageUrl =
                product.cardImage?.url || product.customizedImage?.url || product.blankImage?.url;
              if (!imageUrl) return null;

              return (
                <Link
                  key={String(product._id)}
                  href={`/shop/${product.slug}`}
                  className="group card-vibrant overflow-hidden"
                  data-reveal-item
                >
                  <div className="relative aspect-square overflow-hidden bg-pure-paper">
                    <Image
                      src={imageUrl}
                      alt={`${product.name} blank and customized`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold group-hover:text-royal-blue">{product.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </VibrantSection>

      {/* Customizer preview */}
      <VibrantSection variant="dark">
        <Container className="grid min-w-0 items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-sm border border-chrome-mid/30">
            <Image
              src="/home/customizer-preview.jpg"
              alt="Creative design workspace for custom printing"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
          <div>
            <h2 className="heading-section">Design it your way</h2>
            <p className="mt-4 text-chrome-light">Use our customizer to preview text, colours, and artwork on select products before you order.</p>
            <Link href="/customize" className={cn(buttonVariants("primary"), "mt-8 inline-flex")}>Open customizer</Link>
          </div>
        </Container>
      </VibrantSection>

      {/* Pricing highlights */}
      <VibrantSection variant="light">
        <Container>
          <h2 className="heading-section gradient-heading">Starting prices</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-reveal-stagger>
            {PRICING_CATALOG.map((entry) => (
              <Link
                key={entry.slug}
                href={`/shop/${entry.slug}`}
                className="card-vibrant block p-5 transition-shadow hover:shadow-md"
                data-reveal-item
              >
                <p className="font-semibold">{entry.displayName}</p>
                <p className="mt-2 text-2xl font-bold text-royal-blue">
                  {entry.quote ? "Quote" : formatCurrency(entry.price ?? 0)}
                </p>
                {entry.note && <p className="mt-1 text-xs text-chrome-mid">{entry.note}</p>}
                {!entry.quote && entry.minQuantity && entry.minQuantity > 1 && !entry.note && (
                  <p className="mt-1 text-xs text-chrome-mid">Minimum order {entry.minQuantity}</p>
                )}
              </Link>
            ))}
          </div>
          <Link href="/pricing" className="mt-8 inline-block text-sm font-semibold text-royal-blue hover:underline">
            Full pricing details →
          </Link>
        </Container>
      </VibrantSection>

      {/* Quality section */}
      <VibrantSection variant="dark">
        <Container className="grid min-w-0 items-center gap-12 lg:grid-cols-2">
          <div className="min-w-0 pt-8 sm:pt-10 lg:pt-14">
            <h2 className="heading-section">Quality you can feel</h2>
            <p className="mt-4 text-chrome-light">We treat every order — from a single mug to a bulk pen run — with the same attention to colour, placement, and durability.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {qualitySamples.map((item) => (
              <div
                key={item.src}
                className="relative aspect-square overflow-hidden rounded-sm border border-chrome-mid/30 bg-pure-paper"
              >
                <Image src={item.src} alt={item.alt} fill className="object-cover" sizes="25vw" />
              </div>
            ))}
          </div>
        </Container>
      </VibrantSection>

      {/* Testimonials preview */}
      {testimonialPreview.length > 0 && (
        <VibrantSection variant="light" className="border-t border-chrome-light/40 bg-chrome-light/10">
          <Container className="mx-auto max-w-5xl text-center">
            <h2 className="heading-section">Customer stories</h2>
            <p className="mx-auto mt-3 max-w-2xl text-chrome-mid">
              Hear from people who turned their ideas into printed keepsakes, gifts, and everyday products.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-6" data-reveal-stagger>
              {testimonialPreview.map((t) => (
                <blockquote
                  key={String(t._id)}
                  className="card-vibrant w-full max-w-md p-6 text-left"
                  data-reveal-item
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
        </VibrantSection>
      )}

      {/* FAQ preview */}
      {faqPreview.length > 0 && (
        <VibrantSection variant="mesh">
          <Container>
            <h2 className="heading-section">Questions answered</h2>
            <dl className="mt-10 space-y-6" data-reveal-stagger>
              {faqPreview.map((faq) => (
                <div key={String(faq._id)} className="card-vibrant border-b-0 p-5" data-reveal-item>
                  <dt className="font-semibold">{faq.question}</dt>
                  <dd className="mt-2 text-sm text-carbon">{faq.answer}</dd>
                </div>
              ))}
            </dl>
            <Link href="/faqs" className="mt-8 inline-block text-sm font-semibold text-royal-blue hover:underline">All FAQs →</Link>
          </Container>
        </VibrantSection>
      )}

      {/* Contact / newsletter */}
      <VibrantSection variant="dark">
        <Container className="grid min-w-0 items-center gap-12 lg:grid-cols-2">
          <div className="min-w-0 pt-8 sm:pt-10 lg:pt-14">
            <h2 className="heading-section">{cmsHeading(cmsPage, "contact-cta", "Ready to start?")}</h2>
            <p className="mt-4 break-words text-chrome-light">Tell us about your project. We typically respond within one business day.</p>
            <div className="mt-8 space-y-2 break-words text-sm text-chrome-light">
              <p className="break-all">Email: {settings.contact?.email || siteDefaults.email}</p>
              <p>Phone: {settings.contact?.phone || siteDefaults.phone}</p>
            </div>
          </div>
          <div className="min-w-0 rounded-sm border border-chrome-mid/40 bg-carbon/80 p-4 shadow-[0_0_40px_rgba(6,94,229,0.15)] backdrop-blur-sm sm:p-6">
            <ContactForm serviceOptions={serviceOptions} />
          </div>
        </Container>
      </VibrantSection>
    </>
  );
}
