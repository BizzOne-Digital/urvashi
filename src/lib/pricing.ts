import { IProduct } from "@/models/Product";
import { IPricingRule } from "@/models/PricingRule";
import { formatCurrency } from "./utils";

export interface CartItemInput {
  productId: string;
  productSlug: string;
  productName: string;
  sku?: string;
  quantity: number;
  pricingMode: "fixed" | "quote";
  unitPrice?: number;
  variantSelections?: Record<string, string>;
  printLocation?: string;
  customization?: {
    text?: string;
    font?: string;
    color?: string;
    instructions?: string;
    previewAssetId?: string;
    artworkAssetId?: string;
    configSnapshot?: Record<string, unknown>;
  };
}

export interface CalculatedLineItem {
  productId: string;
  productSlug: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  pricingMode: "fixed" | "quote";
  variantSelections?: Record<string, string>;
  printLocation?: string;
  customization?: CartItemInput["customization"];
  errors: string[];
}

export interface CartCalculation {
  items: CalculatedLineItem[];
  fixedSubtotal: number;
  quoteItems: CalculatedLineItem[];
  hasQuoteItems: boolean;
  hasFixedItems: boolean;
  errors: string[];
  currency: string;
}

export function calculateLinePrice(
  product: IProduct,
  pricingRule: IPricingRule | null,
  item: CartItemInput
): { unitPrice: number; errors: string[] } {
  const errors: string[] = [];

  if (product.pricingMode === "quote" || product.availability === "quote_only") {
    return { unitPrice: 0, errors: [] };
  }

  const minQty = product.minQuantity || pricingRule?.minQuantity || 1;
  if (item.quantity < minQty) {
    errors.push(`Minimum quantity for ${product.name} is ${minQty}`);
  }

  let unitPrice = product.price ?? pricingRule?.basePrice ?? 0;

  if (item.variantSelections) {
    for (const variant of product.variants || []) {
      const selected = item.variantSelections[variant.name];
      if (selected) {
        const opt = variant.options.find((o) => o.value === selected);
        if (opt?.surcharge) unitPrice += opt.surcharge;
        const ruleSurcharge = pricingRule?.variantSurcharges?.find(
          (s) => s.variantName === variant.name && s.optionValue === selected
        );
        if (ruleSurcharge) unitPrice += ruleSurcharge.surcharge;
      }
    }
  }

  if (item.printLocation) {
    const loc = product.printLocations?.find((l) => l.id === item.printLocation);
    if (loc?.surcharge) unitPrice += loc.surcharge;
    const ruleLoc = pricingRule?.printLocationSurcharges?.find(
      (s) => s.locationId === item.printLocation
    );
    if (ruleLoc) unitPrice += ruleLoc.surcharge;
  }

  if (pricingRule?.quantityTiers?.length) {
    const sorted = [...pricingRule.quantityTiers].sort((a, b) => b.minQty - a.minQty);
    for (const tier of sorted) {
      if (item.quantity >= tier.minQty) {
        unitPrice = tier.price;
        break;
      }
    }
  }

  return { unitPrice, errors };
}

export function calculateCart(
  items: CartItemInput[],
  products: Map<string, IProduct>,
  pricingRules: Map<string, IPricingRule>,
  currency = "CAD"
): CartCalculation {
  const calculated: CalculatedLineItem[] = [];
  const allErrors: string[] = [];

  for (const item of items) {
    const product = products.get(item.productId);
    if (!product) {
      allErrors.push(`Product not found: ${item.productName}`);
      continue;
    }

    if (product.status !== "published") {
      allErrors.push(`${product.name} is no longer available`);
      continue;
    }

    const rule = pricingRules.get(item.productId) || null;
    const isQuote = product.pricingMode === "quote" || product.availability === "quote_only";

    if (isQuote) {
      calculated.push({
        ...item,
        unitPrice: 0,
        lineTotal: 0,
        pricingMode: "quote",
        errors: [],
      });
      continue;
    }

    const { unitPrice, errors } = calculateLinePrice(product, rule, item);
    allErrors.push(...errors);

    if (product.stock !== undefined && product.stock !== null) {
      if (item.quantity > product.stock) {
        allErrors.push(`Only ${product.stock} of ${product.name} available`);
      }
    }

    calculated.push({
      productId: item.productId,
      productSlug: item.productSlug,
      productName: item.productName,
      sku: product.sku,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      pricingMode: "fixed",
      variantSelections: item.variantSelections,
      printLocation: item.printLocation,
      customization: item.customization,
      errors,
    });
  }

  const fixedItems = calculated.filter((i) => i.pricingMode === "fixed");
  const quoteItems = calculated.filter((i) => i.pricingMode === "quote");

  return {
    items: calculated,
    fixedSubtotal: fixedItems.reduce((sum, i) => sum + i.lineTotal, 0),
    quoteItems,
    hasQuoteItems: quoteItems.length > 0,
    hasFixedItems: fixedItems.length > 0,
    errors: allErrors,
    currency,
  };
}

export function getProductPriceDisplay(
  product: {
    pricingMode?: string;
    price?: number | null;
    availability?: string;
    currency?: string;
  },
  currency = "CAD"
): { display: string; isQuote: boolean } {
  if (product.pricingMode === "quote" || product.availability === "quote_only" || product.price == null) {
    return { display: "Contact for price", isQuote: true };
  }
  return { display: formatCurrency(product.price, currency), isQuote: false };
}

export function getStartingPriceDisplay(
  product: Pick<IProduct, "pricingMode" | "price" | "minQuantity"> & {
    availability?: IProduct["availability"];
    currency?: string;
  },
  currency = "CAD"
): string {
  const { display, isQuote } = getProductPriceDisplay(product, currency);
  if (isQuote) return display;
  if (product.minQuantity > 1) {
    return `${display} each (min. ${product.minQuantity})`;
  }
  return display;
}
