"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: Array<{ url: string; alt?: string }>;
  name: string;
  className?: string;
}

export function ProductGallery({ images, name, className }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const gallery = images.length > 0 ? images : [{ url: "/demo/ink-lab.svg", alt: name }];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative aspect-square overflow-hidden rounded-sm border border-chrome-light/60 bg-chrome-light/10">
        <Image
          src={gallery[active].url}
          alt={gallery[active].alt || name}
          fill
          className="object-contain p-6"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      {gallery.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {gallery.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-sm border bg-chrome-light/10 transition-all",
                active === i ? "border-royal-blue ring-2 ring-royal-blue/30" : "border-chrome-light/60"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img.url} alt="" fill className="object-contain p-1" sizes="10vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
