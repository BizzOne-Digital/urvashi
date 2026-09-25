import type { HomeViralMediaItem } from "./home-viral";

export function fallbackViralGallery(product: {
  name: string;
  customizedImage?: { url: string; alt?: string };
  cardImage?: { url: string; alt?: string };
  blankImage?: { url: string; alt?: string };
  images?: Array<{ url: string; alt?: string }>;
}): HomeViralMediaItem[] {
  const seen = new Set<string>();
  const out: HomeViralMediaItem[] = [];

  const add = (url?: string, alt?: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ type: "image", url, alt: alt || `${product.name} photo` });
  };

  add(product.customizedImage?.url, product.customizedImage?.alt);
  add(product.cardImage?.url, product.cardImage?.alt);
  add(product.blankImage?.url, product.blankImage?.alt);
  for (const img of product.images || []) {
    add(img.url, img.alt);
  }

  return out;
}

export function resolveViralGallery(
  product: {
    name: string;
    customizedImage?: { url: string; alt?: string };
    cardImage?: { url: string; alt?: string };
    blankImage?: { url: string; alt?: string };
    images?: Array<{ url: string; alt?: string }>;
  },
  configured?: HomeViralMediaItem[]
): HomeViralMediaItem[] {
  const media = configured?.filter((m) => m.url?.trim()) || [];
  if (media.length) return media;
  return fallbackViralGallery(product);
}

export function isYoutubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

export function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
