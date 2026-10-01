import { describe, expect, it } from "vitest";
import {
  calculateCart,
  calculateLinePrice,
  getProductPriceDisplay,
} from "@/lib/pricing";
import type { IProduct } from "@/models/Product";

function buildProduct(overrides: Partial<IProduct> & Pick<IProduct, "name" | "slug">): IProduct {
  return {
    _id: overrides._id || "prod-id",
    name: overrides.name,
    slug: overrides.slug,
    sku: overrides.sku || "SKU-TEST",
    tags: overrides.tags || [],
    pricingMode: overrides.pricingMode || "fixed",
    price: overrides.price,
    currency: overrides.currency || "CAD",
    minQuantity: overrides.minQuantity ?? 1,
    quantityStep: overrides.quantityStep ?? 1,
    availability: overrides.availability || "in_stock",
    variants: overrides.variants || [],
    printLocations: overrides.printLocations || [],
    customizationFields: overrides.customizationFields || [],
    optionSurcharges: overrides.optionSurcharges || [],
    images: overrides.images || [],
    customizer: overrides.customizer || { enabled: false },
    featured: overrides.featured ?? false,
    onSale: overrides.onSale ?? false,
    status: overrides.status || "published",
    relatedProductIds: overrides.relatedProductIds || [],
    relatedGalleryIds: overrides.relatedGalleryIds || [],
    seo: overrides.seo || {},
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
  } as IProduct;
}

describe("pricing", () => {
  it("enforces the custom pen minimum quantity of 5", () => {
    const pen = buildProduct({
      name: "Custom Pen",
      slug: "custom-pen",
      price: 3.99,
      minQuantity: 5,
    });

    const belowMinimum = calculateLinePrice(pen, null, {
      productId: "pen-id",
      productSlug: pen.slug,
      productName: pen.name,
      quantity: 4,
      pricingMode: "fixed",
    });

    const atMinimum = calculateLinePrice(pen, null, {
      productId: "pen-id",
      productSlug: pen.slug,
      productName: pen.name,
      quantity: 5,
      pricingMode: "fixed",
    });

    expect(belowMinimum.errors).toContain("Minimum quantity for Custom Pen is 5");
    expect(atMinimum.errors).toHaveLength(0);
    expect(atMinimum.unitPrice).toBe(3.99);
  });

  it("returns Contact for price on quote-only products", () => {
    const quoteProduct = buildProduct({
      name: "Blanket Cover",
      slug: "blanket-cover",
      pricingMode: "quote",
      availability: "quote_only",
      price: undefined,
    });

    const display = getProductPriceDisplay(quoteProduct, "CAD");

    expect(display.isQuote).toBe(true);
    expect(display.display).toBe("Contact for price");
  });

  it("calculates cart totals with print location surcharges", () => {
    const shirt = buildProduct({
      name: "Premium Tee",
      slug: "premium-tee",
      price: 19.99,
      printLocations: [
        { id: "front", label: "Front", surcharge: 0 },
        { id: "back", label: "Back", surcharge: 6 },
      ],
    });

    const products = new Map([[shirt._id.toString(), shirt]]);
    const cart = calculateCart(
      [
        {
          productId: shirt._id.toString(),
          productSlug: shirt.slug,
          productName: shirt.name,
          quantity: 2,
          pricingMode: "fixed",
          printLocation: "back",
        },
      ],
      products,
      new Map()
    );

    expect(cart.errors).toHaveLength(0);
    expect(cart.items[0]?.unitPrice).toBe(25.99);
    expect(cart.items[0]?.lineTotal).toBe(51.98);
    expect(cart.fixedSubtotal).toBe(51.98);
    expect(cart.hasQuoteItems).toBe(false);
  });

  it("never shows $0 for blanket, cap, or hoodie quote products", () => {
    const quoteProducts = [
      buildProduct({
        name: "Blanket Cover",
        slug: "blanket-cover",
        pricingMode: "quote",
        availability: "quote_only",
        price: undefined,
      }),
      buildProduct({
        name: "Cap",
        slug: "cap",
        pricingMode: "quote",
        availability: "quote_only",
        price: 0,
      }),
      buildProduct({
        name: "Hoodie",
        slug: "hoodie",
        pricingMode: "quote",
        availability: "quote_only",
        price: undefined,
      }),
    ];

    for (const product of quoteProducts) {
      const display = getProductPriceDisplay(product, "CAD");
      expect(display.display).toBe("Contact for price");
      expect(display.display).not.toMatch(/\$0\.00/);
      expect(display.isQuote).toBe(true);
    }
  });
});
