/** Placeholder when legacy disk uploads are missing on serverless hosts */
export const IMAGE_PLACEHOLDER = "/demo/ink-lab.svg";

export function isLegacyDiskUploadUrl(url: string): boolean {
  return url.startsWith("/uploads/") || url.startsWith("/media/");
}

/**
 * Resolve image src for display. Legacy `/uploads/` and `/media/` paths may 404 on Vercel.
 */
export function resolveImageSrc(url?: string | null): string {
  if (!url) return IMAGE_PLACEHOLDER;
  if (isLegacyDiskUploadUrl(url)) return IMAGE_PLACEHOLDER;
  return url;
}
