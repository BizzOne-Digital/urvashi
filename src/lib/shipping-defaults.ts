/** Default parcel specs per product slug (grams, cm). Used when product has no shipping fields. */
export const PRODUCT_SHIPPING_DEFAULTS: Record<
  string,
  { weightGrams: number; lengthCm: number; widthCm: number; heightCm: number }
> = {
  keychains: { weightGrams: 40, lengthCm: 8, widthCm: 5, heightCm: 2 },
  "sublimation-keychains": { weightGrams: 45, lengthCm: 8, widthCm: 5, heightCm: 2 },
  "sublimation-desk-calendar": { weightGrams: 350, lengthCm: 25, widthCm: 20, heightCm: 2 },
  "sublimation-pens": { weightGrams: 30, lengthCm: 15, widthCm: 2, heightCm: 2 },
  "sublimation-ornaments": { weightGrams: 80, lengthCm: 10, widthCm: 10, heightCm: 3 },
  tumblers: { weightGrams: 450, lengthCm: 12, widthCm: 12, heightCm: 22 },
  "glass-tumblers": { weightGrams: 500, lengthCm: 10, widthCm: 10, heightCm: 18 },
  "sublimation-mug": { weightGrams: 400, lengthCm: 12, widthCm: 9, heightCm: 11 },
};

export const FALLBACK_PARCEL = {
  weightGrams: 300,
  lengthCm: 25,
  widthCm: 20,
  heightCm: 10,
};
