import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { HighlightStrip } from "@/components/ui/HighlightStrip";
import { StatsBar } from "@/components/ui/StatsBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buttonVariants } from "@/components/ui/Button";
import { getPublishedPageBySlug } from "@/lib/public-data";
import { cmsBody, getPageSection, pageMetadata, sectionItems, sectionText } from "@/lib/page-content";
import { siteDefaults } from "@/lib/brand";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug("about");
  return pageMetadata(page, {
    title: "About",
    description: "Learn about DPM Custom Prints — custom printing on drinkware, apparel, gifts, and more.",
  });
}

/** Before/after product card images for the about page showcase */
const ABOUT_SHOWCASE = [
  { src: "/products/tumblers/card.png", alt: "Tumblers blank and customized" },
  { src: "/products/sublimation-mug/card.png", alt: "Sublimation mug blank and customized" },
  { src: "/products/keychains/card.png", alt: "Keychains blank and customized" },
  { src: "/products/glass-tumblers/card.png", alt: "Glass tumblers blank and customized" },
  { src: "/products/sublimation-pens/card.png", alt: "Sublimation pens blank and customized" },
  { src: "/products/sublimation-keychains/card.png", alt: "Sublimation keychains blank and customized" },
] as const;

function resolveShowcaseImage(img?: string, fallback: string = "/products/tumblers/card.png"): string {
  if (!img) return fallback;
  if (img.startsWith("/demo/") || img.endsWith(".svg")) return fallback;
  return img;
}

const defaultPhilosophy = [
  {
    title: "Your vision first",
    desc: "We start with your idea — artwork, text, or branding — and help shape it for print.",
    img: "/products/tumblers/card.png",
  },
  {
    title: "Ink lab precision",
    desc: "CMYK colour workflow and careful placement on every product we print.",
    img: "/products/sublimation-mug/card.png",
  },
  {
    title: "Honest partnership",
    desc: "Clear pricing where available, and transparent quotes when custom work is needed.",
    img: "/products/sublimation-pens/card.png",
  },
];

export default async function AboutPage() {
  const page = await getPublishedPageBySlug("about");
  const hero = getPageSection(page, "hero");
  const story = getPageSection(page, "story");
  const philosophy = getPageSection(page, "philosophy");
  const cta = getPageSection(page, "cta");
  const philosophyCards = sectionItems(philosophy);
  const cards = philosophyCards.length
    ? philosophyCards.map((item, index) => ({
        title: String(item.title || ""),
        desc: String(item.desc || item.description || ""),
        img: resolveShowcaseImage(
          String(item.img || item.image || ""),
          defaultPhilosophy[index % defaultPhilosophy.length].img
        ),
      }))
    : defaultPhilosophy;

  const storyBody =
    cmsBody(page, "story") ||
    "DPM Custom Prints and Ink Supplies brings your ideas to life through thoughtful custom printing on everyday items, meaningful gifts, apparel, drinkware, and keepsakes. Based in the Ottawa area, we work with individuals, families, and businesses who want prints with purpose.\n\nFrom a single personalized mug to promotional pen runs, every order receives the same care — clear communication, honest pricing, and quality you can feel.";

  return (
    <>
      <CmsPageHero
        section={hero}
        fallback={{
          eyebrow: "Our story",
          title: "Ideas deserve to become something you can hold.",
          subtitle: siteDefaults.tagline,
          image: "/products/tumblers/card.png",
        }}
      />

      <HighlightStrip />

      <VibrantSection variant="cosmic" className="!py-12">
        <Container>
          <StatsBar />
        </Container>
      </VibrantSection>

      <VibrantSection variant="mesh">
        <Container className="grid min-w-0 items-center gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <SectionHeader
              eyebrow="About us"
              title={sectionText(story, "heading", "About DPM Custom Prints")}
            />
            {storyBody.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-4 leading-relaxed text-chrome-light">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4" data-reveal-stagger>
            {ABOUT_SHOWCASE.map((item) => (
              <div
                key={item.src}
                className="card-vibrant relative aspect-square overflow-hidden"
                data-reveal-item
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </Container>
      </VibrantSection>

      <VibrantSection variant="dark">
        <Container>
          <SectionHeader
            title={sectionText(philosophy, "heading", "Creative philosophy")}
            subtitle="How we approach every custom print — from one mug to a full promotional run."
          />
          <div className="mt-10 grid gap-8 md:grid-cols-3" data-reveal-stagger>
            {cards.map((item) => (
              <div key={item.title} className="card-vibrant-dark overflow-hidden" data-reveal-item>
                <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-[#0a0c14]">
                  <Image
                    src={item.img}
                    alt={`${item.title} — blank and customized`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-cyan">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-chrome-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </VibrantSection>

      <VibrantSection variant="gradient">
        <Container className="text-center">
          <h2 className="heading-section gradient-heading-light">
            {sectionText(cta, "heading", "Ready to print?")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-chrome-light">
            {sectionText(cta, "body", "Browse our shop, open the customizer, or reach out for a consultation.")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={sectionText(cta, "ctaUrl", "/shop") || "/shop"} className={buttonVariants("primary")}>
              {sectionText(cta, "ctaText", "Shop products")}
            </Link>
            <Link href="/contact" className={cn(buttonVariants("secondary"))}>
              Contact us
            </Link>
          </div>
        </Container>
      </VibrantSection>
    </>
  );
}
