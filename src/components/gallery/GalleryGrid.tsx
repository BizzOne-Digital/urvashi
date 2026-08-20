"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { GalleryLightbox, type GalleryItem } from "@/components/gallery/GalleryLightbox";
import { DpmProductMark } from "@/components/ui/DpmProductImage";
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
      <div className="mb-8 flex flex-wrap gap-2" data-reveal>
        <button
          type="button"
          onClick={() => setCategory("")}
          className={cn(
            "rounded-sm px-4 py-2 text-sm font-semibold transition-all",
            !category
              ? "bg-gradient-to-r from-royal-blue to-cyan text-pure-paper shadow-lg"
              : "bg-chrome-light/30 hover:bg-chrome-light/50"
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
              "rounded-sm px-4 py-2 text-sm font-semibold transition-all",
              category === c.slug
                ? "bg-gradient-to-r from-royal-blue to-cyan text-pure-paper shadow-lg"
                : "bg-chrome-light/30 hover:bg-chrome-light/50"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-carbon">No gallery images in this category yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" data-reveal-stagger>
          {filtered.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group card-vibrant relative aspect-square overflow-hidden bg-gradient-to-br from-chrome-light/20 to-pure-paper"
              data-reveal-item
            >
              <Image
                src={item.url}
                alt={item.alt || "Gallery image"}
                fill
                className="object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                sizes="25vw"
              />
              <DpmProductMark size="sm" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-royal-blue/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
