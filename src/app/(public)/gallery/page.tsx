import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
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
    <section className="overflow-hidden py-12 lg:py-16">
      <Container className="min-w-0">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-royal-blue">Portfolio</p>
          <h1 className="heading-section mt-2">Print gallery</h1>
          <p className="mx-auto mt-3 max-w-2xl text-carbon">
            Samples and inspiration from our ink lab — mugs, apparel, gifts, and more.
          </p>
        </div>

        <GalleryGrid
          items={items}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </Container>
    </section>
  );}
