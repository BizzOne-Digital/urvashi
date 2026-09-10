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

export interface ArtworkBox {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function artworkTransformToBox(transform: ArtworkTransform): ArtworkBox {
  return {
    cx: 50 + transform.offsetX,
    cy: 50 + transform.offsetY,
    w: (transform.scaleX * transform.scale) / 100,
    h: (transform.scaleY * transform.scale) / 100,
  };
}

export function artworkBoxToTransform(
  cx: number,
  cy: number,
  w: number,
  h: number,
  scale: number,
  fit: ArtworkFitMode = "fill"
): ArtworkTransform {
  const clampedW = clamp(w, 15, 400);
  const clampedH = clamp(h, 15, 400);

  return {
    scale,
    scaleX: clamp((clampedW * 100) / scale, 30, 400),
    scaleY: clamp((clampedH * 100) / scale, 30, 400),
    offsetX: Math.round(clamp(cx - 50, -80, 80)),
    offsetY: Math.round(clamp(cy - 50, -80, 80)),
    fit,
  };
}

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
