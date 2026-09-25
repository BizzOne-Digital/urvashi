const NEW_PRODUCT_DAYS = 60;

export function isNewProduct(createdAt?: string | Date | null): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NEW_PRODUCT_DAYS);
  return created >= cutoff;
}

export function isPromoProduct(product: {
  onSale?: boolean;
  featured?: boolean;
}): boolean {
  return Boolean(product.onSale || product.featured);
}

export interface MarqueeItem {
  id: string;
  label: string;
  href: string;
  kind: "new" | "promo";
}

export function buildMarqueeItems(
  products: Array<{
    _id: string;
    name: string;
    slug: string;
    price?: number;
    currency?: string;
    onSale?: boolean;
    featured?: boolean;
    createdAt?: string;
  }>
): MarqueeItem[] {
  const items: MarqueeItem[] = [];

  for (const product of products) {
    const isNew = isNewProduct(product.createdAt);
    const isPromo = isPromoProduct(product);

    if (isNew) {
      items.push({
        id: `${product._id}-new`,
        label: `New — ${product.name}`,
        href: `/shop/${product.slug}`,
        kind: "new",
      });
    } else if (isPromo) {
      items.push({
        id: `${product._id}-promo`,
        label: `Promo — ${product.name}`,
        href: `/shop/${product.slug}`,
        kind: "promo",
      });
    }
  }

  return items;
}
