const FALLBACK_SITE_URL = "http://localhost:3000";

/**
 * Public site origin from NEXT_PUBLIC_SITE_URL, tolerant of common env mistakes
 * (missing https://, trailing slash, stray spaces). An invalid value must never
 * crash the root layout, which would break every page at build time.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    console.warn(`[site-url] Invalid NEXT_PUBLIC_SITE_URL, using ${FALLBACK_SITE_URL}`);
    return FALLBACK_SITE_URL;
  }
}
