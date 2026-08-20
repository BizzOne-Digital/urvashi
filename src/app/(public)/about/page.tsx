import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { DpmProductImage } from "@/components/ui/DpmProductImage";
import { buttonVariants } from "@/components/ui/Button";
import { DEMO_IMAGES } from "@/lib/public-data";
import { siteDefaults } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about DPM Custom Prints — custom printing on drinkware, apparel, gifts, and more.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="Ideas deserve to become something you can hold."
        subtitle={siteDefaults.tagline}
        image="/demo/ink-lab.svg"
      />

      <VibrantSection variant="mesh">
        <Container className="grid min-w-0 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="gradient-eyebrow text-xs font-bold uppercase tracking-[0.2em]">About us</p>
            <h2 className="heading-section mt-3 gradient-heading">About DPM Custom Prints</h2>
            <p className="mt-4 leading-relaxed text-carbon">
              DPM Custom Prints and Ink Supplies brings your ideas to life through thoughtful custom printing on everyday items, meaningful gifts, apparel, drinkware, and keepsakes. Based in the Ottawa area, we work with individuals, families, and businesses who want prints with purpose.
            </p>
            <p className="mt-4 leading-relaxed text-carbon">
              From a single personalized mug to promotional pen runs, every order receives the same care — clear communication, honest pricing, and quality you can feel.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4" data-reveal-stagger>
            {DEMO_IMAGES.slice(0, 6).map((src) => (
              <div key={src} className="card-vibrant relative aspect-square overflow-hidden" data-reveal-item>
                <DpmProductImage src={src} alt="About DPM sample print" fill showDpmMark markSize="sm" imageClassName="object-contain p-4" sizes="25vw" />
              </div>
            ))}
          </div>
        </Container>
      </VibrantSection>

      <VibrantSection variant="dark">
        <Container>
          <h2 className="heading-section">Creative philosophy</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3" data-reveal-stagger>
            {[
              { title: "Your vision first", desc: "We start with your idea — artwork, text, or branding — and help shape it for print.", img: "/demo/tshirt.svg" },
              { title: "Ink lab precision", desc: "CMYK colour workflow and careful placement on every product we print.", img: "/demo/ink-lab.svg" },
              { title: "Honest partnership", desc: "Clear pricing where available, and transparent quotes when custom work is needed.", img: "/demo/mug-white.svg" },
            ].map((item) => (
              <div key={item.title} className="card-vibrant-dark p-6" data-reveal-item>
                <div className="relative mb-4 aspect-video overflow-hidden rounded-sm bg-carbon">
                  <DpmProductImage src={item.img} alt={item.title} fill showDpmMark markSize="md" imageClassName="object-contain p-4" sizes="33vw" />
                </div>
                <h3 className="font-display text-xl font-semibold text-cyan">{item.title}</h3>
                <p className="mt-2 text-sm text-chrome-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </VibrantSection>

      <VibrantSection variant="gradient">
        <Container className="text-center">
          <h2 className="heading-section">Ready to print?</h2>
          <p className="mx-auto mt-4 max-w-xl text-chrome-light">Browse our shop, open the customizer, or reach out for a consultation.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/shop" className={buttonVariants("primary")}>Shop products</Link>
            <Link href="/contact" className={cn(buttonVariants("secondary"), "border-pure-paper text-pure-paper hover:bg-pure-paper hover:text-ink-black")}>Contact us</Link>
          </div>
        </Container>
      </VibrantSection>
    </>
  );
}
