export interface ArtworkTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_ARTWORK_TRANSFORM: ArtworkTransform = {
  scale: 100,
  offsetX: 0,
  offsetY: 0,
};

export function artworkTransformToCss(transform: ArtworkTransform): string {
  return `translate(${transform.offsetX}%, ${transform.offsetY}%) scale(${transform.scale / 100})`;
}

export function formatArtworkTransformNote(transform: ArtworkTransform): string {
  if (
    transform.scale === DEFAULT_ARTWORK_TRANSFORM.scale &&
    transform.offsetX === DEFAULT_ARTWORK_TRANSFORM.offsetX &&
    transform.offsetY === DEFAULT_ARTWORK_TRANSFORM.offsetY
  ) {
    return "";
  }

  return `Artwork placement (preview): zoom ${transform.scale}%, horizontal ${transform.offsetX}%, vertical ${transform.offsetY}%`;
}
