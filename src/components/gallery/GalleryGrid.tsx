"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { GalleryLightbox, type GalleryItem } from "@/components/gallery/GalleryLightbox";
import { cn } from "@/lib/utils";

interface GalleryGridProps {
  items: Array<{
    id: string;
    url: string;
    alt?: string;
    caption?: string;
    category?: string;
  }>;
  categories: Array<{ slug: string; name: string }>;
}

export function GalleryGrid({ items, categories }: GalleryGridProps) {
  const [category, setCategory] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const filtered = useMemo(() => {
    if (!category) return items;
    return items.filter((i) => i.category === category);
  }, [items, category]);

  const lightboxItems: GalleryItem[] = filtered.map((i) => ({
    id: i.id,
    url: i.url,
    alt: i.alt,
    caption: i.caption,
    category: i.category,
  }));

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={cn(
            "rounded-sm px-4 py-2 text-sm font-medium transition-colors",
            !category ? "bg-royal-blue text-pure-paper" : "bg-chrome-light/30 hover:bg-chrome-light/50"
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCategory(c.slug)}
            className={cn(
              "rounded-sm px-4 py-2 text-sm font-medium transition-colors",
              category === c.slug ? "bg-royal-blue text-pure-paper" : "bg-chrome-light/30 hover:bg-chrome-light/50"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-carbon">No gallery images in this category yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-sm border border-chrome-light/60 bg-chrome-light/10 transition-all hover:border-royal-blue hover:shadow-lg"
            >
              <Image
                src={item.url}
                alt={item.alt || "Gallery image"}
                fill
                className="object-contain p-3 transition-transform group-hover:scale-105"
                sizes="25vw"
              />
            </button>
          ))}
        </div>
      )}

      <GalleryLightbox
        items={lightboxItems}
        initialIndex={lightboxIndex}
        open={lightboxIndex >= 0}
        onClose={() => setLightboxIndex(-1)}
      />
    </>
  );
}
