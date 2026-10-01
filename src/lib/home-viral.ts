export interface HomeViralMediaItem {
  type: "image" | "video";
  url: string;
  alt?: string;
}

export interface HomeViralItem {
  slug: string;
  media: HomeViralMediaItem[];
}

export interface HomeViralConfig {
  enabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  productSlugs: string[];
  items: HomeViralItem[];
  lastUpdatedAt?: string;
}

function normalizeMedia(raw: unknown): HomeViralMediaItem[] {
  if (!Array.isArray(raw)) return [];
  const out: HomeViralMediaItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const url = typeof row.url === "string" ? row.url.trim() : "";
    if (!url) continue;
    const type: HomeViralMediaItem["type"] = row.type === "video" ? "video" : "image";
    const alt = typeof row.alt === "string" ? row.alt.trim() : undefined;
    out.push({ type, url, alt });
  }
  return out;
}

export type HomeViralStored = {
  enabled?: boolean;
  eyebrow?: string;
  title?: string;
  description?: string;
  productSlugs?: string[];
  items?: unknown;
  lastUpdatedAt?: string;
};

function normalizeItems(stored: HomeViralStored): HomeViralItem[] {
  if (Array.isArray(stored.items) && stored.items.length) {
    return stored.items
      .map((item) => {
        if (!item || typeof item !== "object") return { slug: "", media: [] as HomeViralMediaItem[] };
        const row = item as { slug?: string; media?: unknown };
        return {
          slug: row.slug?.trim() || "",
          media: normalizeMedia(row.media),
        };
      })
      .filter((item) => item.slug);
  }

  const slugs =
    stored.productSlugs?.filter((s) => typeof s === "string" && s.trim()) ||
    [...DEFAULT_HOME_VIRAL_PRODUCT_SLUGS];

  return slugs.map((slug) => ({ slug, media: [] }));
}

export const DEFAULT_HOME_VIRAL_PRODUCT_SLUGS = [
  "sublimation-mug",
  "custom-t-shirt-half-sleeve",
  "custom-t-shirt-full-sleeve",
] as const;

export const DEFAULT_HOME_VIRAL: HomeViralConfig = {
  enabled: true,
  eyebrow: "Trending now",
  title: "Our viral products",
  description: "Customer favourites — mugs and custom tees that keep selling out.",
  productSlugs: [...DEFAULT_HOME_VIRAL_PRODUCT_SLUGS],
  items: DEFAULT_HOME_VIRAL_PRODUCT_SLUGS.map((slug) => ({ slug, media: [] })),
};

export function resolveHomeViral(stored?: HomeViralStored | null): HomeViralConfig {
  if (!stored) return { ...DEFAULT_HOME_VIRAL, items: [...DEFAULT_HOME_VIRAL.items] };

  const items = normalizeItems(stored);
  const productSlugs = items.map((i) => i.slug);

  return {
    enabled: stored.enabled ?? DEFAULT_HOME_VIRAL.enabled,
    eyebrow: stored.eyebrow?.trim() || DEFAULT_HOME_VIRAL.eyebrow,
    title: stored.title?.trim() || DEFAULT_HOME_VIRAL.title,
    description: stored.description?.trim() || DEFAULT_HOME_VIRAL.description,
    productSlugs: productSlugs.length ? productSlugs : [...DEFAULT_HOME_VIRAL.productSlugs],
    items: items.length ? items : [...DEFAULT_HOME_VIRAL.items],
    lastUpdatedAt: stored.lastUpdatedAt,
  };
}
