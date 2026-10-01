import { cookies } from "next/headers";
import { calculateCart, CartItemInput } from "./pricing";
import { connectDB } from "./db";
import { getSettings } from "./settings";
import Product, { IProduct } from "@/models/Product";
import PricingRule, { IPricingRule } from "@/models/PricingRule";

const CART_COOKIE = "dpm_cart";

export async function getCartFromCookie(): Promise<CartItemInput[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return [];
  }
}

export function serializeCart(items: CartItemInput[]): string {
  return encodeURIComponent(JSON.stringify(items));
}

export const CART_COOKIE_NAME = CART_COOKIE;
export const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 30,
  path: "/",
};

export function cartItemKey(
  item: Pick<CartItemInput, "productId" | "variantSelections" | "printLocation">
): string {
  const variants = item.variantSelections ? JSON.stringify(item.variantSelections) : "";
  const loc = item.printLocation || "";
  return `${item.productId}:${variants}:${loc}`;
}

export async function setCartCookie(items: CartItemInput[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, serializeCart(items), CART_COOKIE_OPTIONS);
}

export async function loadCalculatedCart() {
  await connectDB();
  const items = await getCartFromCookie();

  if (items.length === 0) {
    const settings = await getSettings();
    return calculateCart([], new Map(), new Map(), settings.general.currency);
  }

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map<string, IProduct>(
    products.map((p) => [p._id.toString(), p])
  );

  const pricingRules = await PricingRule.find({
    productId: { $in: productIds },
    isActive: true,
  });
  const ruleMap = new Map<string, IPricingRule>(
    pricingRules
      .filter((r) => r.productId)
      .map((r) => [r.productId!.toString(), r])
  );

  const settings = await getSettings();
  return calculateCart(items, productMap, ruleMap, settings.general.currency);
}

export async function mutateCart(
  action: "add" | "update" | "remove" | "clear",
  payload: {
    item?: CartItemInput;
    key?: string;
    quantity?: number;
  } = {}
) {
  let items = await getCartFromCookie();

  switch (action) {
    case "add": {
      if (!payload.item) throw new Error("Item required for add");
      const key = cartItemKey(payload.item);
      const existing = items.find((i) => cartItemKey(i) === key);
      if (existing) {
        existing.quantity += payload.item.quantity;
        if (payload.item.customization) {
          existing.customization = {
            ...existing.customization,
            ...payload.item.customization,
          };
        }
      } else {
        items.push(payload.item);
      }
      break;
    }
    case "update": {
      if (!payload.key) throw new Error("Key required for update");
      const idx = items.findIndex((i) => cartItemKey(i) === payload.key);
      if (idx === -1) throw new Error("Cart item not found");
      if (payload.quantity !== undefined) {
        if (payload.quantity <= 0) {
          items = items.filter((i) => cartItemKey(i) !== payload.key);
        } else {
          items[idx].quantity = payload.quantity;
        }
      }
      if (payload.item?.customization) {
        items[idx].customization = {
          ...items[idx].customization,
          ...payload.item.customization,
        };
      }
      break;
    }
    case "remove": {
      if (!payload.key) throw new Error("Key required for remove");
      items = items.filter((i) => cartItemKey(i) !== payload.key);
      break;
    }
    case "clear":
      items = [];
      break;
  }

  await setCartCookie(items);
  return loadCalculatedCart();
}
