import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { VibrantSection } from "@/components/ui/VibrantSection";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { DEMO_IMAGES, getGalleryItems, getGalleryCategories } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse custom print samples and inspiration from DPM Custom Prints.",
};

export default async function GalleryPage() {
  const [rawItems, categories] = await Promise.all([getGalleryItems(), getGalleryCategories()]);

  const items =
    rawItems.length > 0
      ? rawItems.map((item, i) => ({
          id: String(item._id || i),
          url: (item as { publicUrl?: string }).publicUrl || (item as { url?: string }).url || DEMO_IMAGES[i % DEMO_IMAGES.length],
          alt: (item as { alt?: string }).alt || (item as { originalName?: string }).originalName,
          caption: (item as { caption?: string }).caption,
          category: (item as { category?: string }).category,
        }))
      : DEMO_IMAGES.map((url, i) => ({
          id: String(i),
          url,
          alt: `Gallery sample ${i + 1}`,
          category: undefined,
        }));

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Print gallery"
        subtitle="Samples and inspiration from our ink lab — mugs, apparel, gifts, and more."
        image="/demo/mug-white.svg"
      />

      <VibrantSection variant="mesh" reveal={false}>
        <Container className="min-w-0">
          <GalleryGrid
            items={items}
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          />
        </Container>
      </VibrantSection>
    </>
  );
}
