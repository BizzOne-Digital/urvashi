"use client";

import { useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass } from "@/components/admin/FormField";
import type { HomeViralConfig, HomeViralItem } from "@/lib/home-viral";
import { HomeViralGalleryEditor } from "./HomeViralGalleryEditor";
import { cn } from "@/lib/utils";

interface ProductOption {
  slug: string;
  name: string;
}

interface HomeViralFormProps {
  initialConfig: HomeViralConfig;
  products: ProductOption[];
}

function syncItemsFromSlugs(items: HomeViralItem[], slugs: string[]): HomeViralItem[] {
  const bySlug = new Map(items.map((i) => [i.slug, i]));
  return slugs.map((slug) => bySlug.get(slug) || { slug, media: [] });
}

export function HomeViralForm({ initialConfig, products }: HomeViralFormProps) {
  const [config, setConfig] = useState<HomeViralConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(config.productSlugs), [config.productSlugs]);

  const setItems = (items: HomeViralItem[]) => {
    setConfig((prev) => ({
      ...prev,
      items,
      productSlugs: items.map((i) => i.slug),
    }));
  };

  const toggleSlug = (slug: string) => {
    setConfig((prev) => {
      let slugs: string[];
      if (prev.productSlugs.includes(slug)) {
        slugs = prev.productSlugs.filter((s) => s !== slug);
        if (expandedSlug === slug) setExpandedSlug(null);
      } else {
        slugs = [...prev.productSlugs, slug];
        setExpandedSlug(slug);
      }
      const items = syncItemsFromSlugs(prev.items, slugs);
      return { ...prev, productSlugs: slugs, items };
    });
  };

  const moveSlug = (slug: string, direction: -1 | 1) => {
    setConfig((prev) => {
      const idx = prev.productSlugs.indexOf(slug);
      if (idx < 0) return prev;
      const next = idx + direction;
      if (next < 0 || next >= prev.productSlugs.length) return prev;
      const slugs = [...prev.productSlugs];
      [slugs[idx], slugs[next]] = [slugs[next], slugs[idx]];
      const items = syncItemsFromSlugs(prev.items, slugs);
      return { ...prev, productSlugs: slugs, items };
    });
  };

  const updateItemMedia = (slug: string, media: HomeViralItem["media"]) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.slug === slug ? { ...item, media } : item)),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: HomeViralConfig = {
        ...config,
        items: config.items.map((item) => ({
          ...item,
          media: item.media.filter((m) => m.url.trim()),
        })),
      };

      const res = await adminFetch<{ homeViral: HomeViralConfig }>("/api/admin/home-viral", {
        method: "PUT",
        body: JSON.stringify(payload),
        successMessage: "Homepage viral section updated",
      });
      setConfig(res.homeViral);
    } finally {
      setSaving(false);
    }
  };

  const lastUpdated = config.lastUpdatedAt
    ? new Date(config.lastUpdatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-chrome-light/20 bg-white p-6 shadow-sm">
        <p className="text-sm text-chrome-mid">
          This block appears on the homepage directly under the hero. Visitors tap a product to open a
          photo/video gallery, then customize from the last step.
        </p>
        {lastUpdated && (
          <p className="mt-2 text-xs text-chrome-mid">Last saved: {lastUpdated}</p>
        )}
      </div>

      <div className="rounded-xl border border-chrome-light/20 bg-white p-6 shadow-sm space-y-5">
        <label className="flex items-center gap-2 text-sm font-medium text-carbon">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig((c) => ({ ...c, enabled: e.target.checked }))}
          />
          Show section on homepage
        </label>

        <FormField label="Eyebrow (small label)">
          <input
            className={inputClass}
            value={config.eyebrow}
            onChange={(e) => setConfig((c) => ({ ...c, eyebrow: e.target.value }))}
            placeholder="Trending now"
          />
        </FormField>

        <FormField label="Heading">
          <input
            className={inputClass}
            value={config.title}
            onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
            placeholder="Our viral products"
          />
        </FormField>

        <FormField label="Short description">
          <textarea
            className={textareaClass}
            rows={2}
            value={config.description}
            onChange={(e) => setConfig((c) => ({ ...c, description: e.target.value }))}
          />
        </FormField>
      </div>

      <div className="rounded-xl border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-carbon">Products in this section</h2>
        <p className="mt-1 text-sm text-chrome-mid">
          Check products to include. Expand each row to add photos and videos for the homepage gallery.
        </p>

        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-chrome-light/30 p-3">
          {products.map((p) => (
            <li key={p.slug}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-carbon">
                <input
                  type="checkbox"
                  checked={selectedSet.has(p.slug)}
                  onChange={() => toggleSlug(p.slug)}
                />
                <span>{p.name}</span>
                <span className="text-xs text-chrome-mid">({p.slug})</span>
              </label>
            </li>
          ))}
        </ul>

        {config.items.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-carbon">Display order & galleries</p>
            {config.items.map((item, i) => {
              const product = products.find((p) => p.slug === item.slug);
              const open = expandedSlug === item.slug;
              return (
                <div
                  key={item.slug}
                  className="rounded-lg border border-chrome-light/30 bg-carbon/5 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <button
                      type="button"
                      className="font-medium text-carbon text-left hover:text-royal-blue"
                      onClick={() => setExpandedSlug(open ? null : item.slug)}
                    >
                      {i + 1}. {product?.name || item.slug}
                      <span className="ml-2 text-xs text-chrome-mid">
                        ({item.media.length} gallery items)
                      </span>
                    </button>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        className="rounded border border-royal-blue/40 bg-royal-blue/10 px-2 py-0.5 text-xs font-medium text-royal-blue hover:bg-royal-blue/20"
                        onClick={() => setExpandedSlug(open ? null : item.slug)}
                      >
                        {open ? "Hide gallery" : "Add photos & videos"}
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "rounded border border-chrome-light/40 px-2 py-0.5 text-xs hover:bg-white",
                          i === 0 && "opacity-40"
                        )}
                        disabled={i === 0}
                        onClick={() => moveSlug(item.slug, -1)}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "rounded border border-chrome-light/40 px-2 py-0.5 text-xs hover:bg-white",
                          i === config.items.length - 1 && "opacity-40"
                        )}
                        disabled={i === config.items.length - 1}
                        onClick={() => moveSlug(item.slug, 1)}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        className="rounded border border-chrome-light/40 px-2 py-0.5 text-xs text-red-700 hover:bg-white"
                        onClick={() => toggleSlug(item.slug)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {open && (
                    <HomeViralGalleryEditor
                      item={item}
                      productName={product?.name || item.slug}
                      onChange={(media) => updateItemMedia(item.slug, media)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Button type="button" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save homepage section"}
      </Button>
    </div>
  );
}
