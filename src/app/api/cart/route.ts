import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loadCalculatedCart, mutateCart } from "@/lib/cart";
import { CartItemInput } from "@/lib/pricing";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  sku: z.string().optional(),
  quantity: z.number().int().positive(),
  pricingMode: z.enum(["fixed", "quote"]),
  unitPrice: z.number().optional(),
  variantSelections: z.record(z.string()).optional(),
  printLocation: z.string().optional(),
  customization: z
    .object({
      text: z.string().optional(),
      font: z.string().optional(),
      color: z.string().optional(),
      instructions: z.string().optional(),
      previewAssetId: z.string().optional(),
      artworkAssetId: z.string().optional(),
      configSnapshot: z.record(z.unknown()).optional(),
    })
    .optional(),
});

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add"),
    item: cartItemSchema,
  }),
  z.object({
    action: z.literal("update"),
    key: z.string().min(1),
    quantity: z.number().int().positive().optional(),
    customization: cartItemSchema.shape.customization,
  }),
  z.object({
    action: z.literal("remove"),
    key: z.string().min(1),
  }),
  z.object({
    action: z.literal("clear"),
  }),
]);

export async function GET() {
  try {
    const cart = await loadCalculatedCart();
    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

    return NextResponse.json({
      itemCount,
      cart,
    });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { action } = parsed.data;
    let cart;

    switch (action) {
      case "add":
        cart = await mutateCart("add", { item: parsed.data.item as CartItemInput });
        break;
      case "update":
        cart = await mutateCart("update", {
          key: parsed.data.key,
          quantity: parsed.data.quantity,
          item: parsed.data.customization
            ? ({ customization: parsed.data.customization } as CartItemInput)
            : undefined,
        });
        break;
      case "remove":
        cart = await mutateCart("remove", { key: parsed.data.key });
        break;
      case "clear":
        cart = await mutateCart("clear");
        break;
    }

    const itemCount = cart!.items.reduce((sum, i) => sum + i.quantity, 0);

    return NextResponse.json({
      itemCount,
      cart,
    });
  } catch (error) {
    console.error("Cart POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to update cart";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
