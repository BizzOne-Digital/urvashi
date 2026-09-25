/** Canadian postal code helpers (A1A 1A1). */

export function compactCanadianPostalCode(input: string): string {
  return input.replace(/\s+/g, "").toUpperCase();
}

export function isValidCanadianPostalCode(input: string): boolean {
  const compact = compactCanadianPostalCode(input);
  return /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/.test(compact);
}

/** Returns formatted postal code (A1A 1A1) or null if invalid. */
export function formatCanadianPostalCode(input?: string): string | null {
  if (!input?.trim()) return null;
  const compact = compactCanadianPostalCode(input);
  if (!isValidCanadianPostalCode(compact)) return null;
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}
