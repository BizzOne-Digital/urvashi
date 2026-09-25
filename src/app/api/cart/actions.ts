"use server";

import { CartItemInput } from "@/lib/pricing";
import { mutateCart } from "@/lib/cart";

export async function addToCart(item: CartItemInput) {
  return mutateCart("add", { item });
}

export async function updateCartItem(key: string, quantity: number) {
  return mutateCart("update", { key, quantity });
}

export async function removeFromCart(key: string) {
  return mutateCart("remove", { key });
}

export async function clearCart() {
  return mutateCart("clear");
}
