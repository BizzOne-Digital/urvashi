export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export async function createStripeCheckoutSession(params: {
  lineItems: Array<{ name: string; amount: number; quantity: number }>;
  orderNumber: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string } | null> {
  if (!isStripeConfigured()) return null;

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: params.lineItems.map((item) => ({
        price_data: {
          currency: "cad",
          product_data: { name: item.name },
          unit_amount: Math.round(item.amount * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      metadata: { orderNumber: params.orderNumber },
    });

    if (!session.url) return null;
    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return null;
  }
}
