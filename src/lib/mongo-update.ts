/**
 * Admin forms send `null` for a field the user cleared (JSON drops `undefined`, so a
 * cleared field would otherwise silently keep its old value). Split those out so the
 * route can `$unset` them instead of `$set`-ing null.
 */
export function splitNullFields(body: Record<string, unknown>): {
  set: Record<string, unknown>;
  unset: Record<string, "">;
} {
  const set: Record<string, unknown> = {};
  const unset: Record<string, ""> = {};

  for (const [key, value] of Object.entries(body)) {
    if (value === null) unset[key] = "";
    else set[key] = value;
  }

  return { set, unset };
}
