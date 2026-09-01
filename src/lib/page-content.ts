import type { IPageSection } from "@/models/Page";

export interface PlainPage {
  slug: string;
  title: string;
  status: string;
  sections: IPageSection[];
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
    canonical?: string;
  };
}

export function getPageSection(
  page: PlainPage | null | undefined,
  key: string
): IPageSection | undefined {
  if (!page?.sections?.length) return undefined;
  const section = page.sections.find((s) => s.key === key);
  if (!section || section.enabled === false) return undefined;
  return section;
}

export function sectionText(
  section: IPageSection | undefined,
  field: "eyebrow" | "heading" | "subheading" | "body" | "ctaText" | "ctaUrl",
  fallback = ""
): string {
  const value = section?.[field];
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function sectionImage(section: IPageSection | undefined, fallback?: string): string | undefined {
  return section?.image?.url || section?.images?.[0]?.url || fallback;
}

export function cmsHeading(page: PlainPage | null | undefined, key: string, fallback: string): string {
  return sectionText(getPageSection(page, key), "heading", fallback);
}

export function cmsBody(page: PlainPage | null | undefined, key: string, fallback = ""): string {
  return sectionText(getPageSection(page, key), "body", fallback);
}

export interface CmsItem {
  title?: string;
  desc?: string;
  description?: string;
  img?: string;
  image?: string;
  [key: string]: unknown;
}

export function sectionItems(section: IPageSection | undefined): CmsItem[] {
  if (!section?.items?.length) return [];
  return section.items as CmsItem[];
}

export function pageMetadata(page: PlainPage | null | undefined, defaults: { title: string; description: string }) {
  return {
    title: page?.seo?.title || page?.title || defaults.title,
    description: page?.seo?.description || defaults.description,
  };
}
