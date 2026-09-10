export type ArtworkFitMode = "cover" | "fill" | "contain";

export interface ArtworkTransform {
  scale: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
  fit: ArtworkFitMode;
}

export const DEFAULT_ARTWORK_TRANSFORM: ArtworkTransform = {
  scale: 100,
  scaleX: 100,
  scaleY: 100,
  offsetX: 0,
  offsetY: 0,
  fit: "cover",
};

/** Good starting point so uploads cover the print area immediately. */
export const FILL_PRINT_AREA_TRANSFORM: ArtworkTransform = {
  scale: 100,
  scaleX: 100,
  scaleY: 100,
  offsetX: 0,
  offsetY: 0,
  fit: "cover",
};

export function artworkTransformToCss(transform: ArtworkTransform): string {
  const sx = (transform.scaleX * transform.scale) / 10000;
  const sy = (transform.scaleY * transform.scale) / 10000;
  return `scale(${sx}, ${sy})`;
}

export function formatArtworkTransformNote(transform: ArtworkTransform): string {
  const isDefault =
    transform.scale === DEFAULT_ARTWORK_TRANSFORM.scale &&
    transform.scaleX === DEFAULT_ARTWORK_TRANSFORM.scaleX &&
    transform.scaleY === DEFAULT_ARTWORK_TRANSFORM.scaleY &&
    transform.offsetX === DEFAULT_ARTWORK_TRANSFORM.offsetX &&
    transform.offsetY === DEFAULT_ARTWORK_TRANSFORM.offsetY &&
    transform.fit === DEFAULT_ARTWORK_TRANSFORM.fit;

  if (isDefault) return "";

  return [
    "Artwork placement (preview):",
    `fit ${transform.fit}`,
    `zoom ${transform.scale}%`,
    `width ${transform.scaleX}%`,
    `height ${transform.scaleY}%`,
    `position ${transform.offsetX}% / ${transform.offsetY}%`,
  ].join(" ");
}
