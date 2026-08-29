import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { connectDB } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { getCachedSettings } from "@/lib/settings";
import Order from "@/models/Order";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your DPM Custom Prints order confirmation.",
};

interface Props {
  searchParams: Promise<{ orderNumber?: string; token?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { orderNumber, token } = await searchParams;

  if (!orderNumber || !token) {
    notFound();
  }

  let order = null;
  try {
    await connectDB();
    order = await Order.findOne({ orderNumber, accessToken: token }).lean();
  } catch {
    order = null;
  }

  if (!order) {
    notFound();
  }

  const settings = await getCachedSettings();
  const confirmationCopy =
    settings.commerce?.orderConfirmationCopy ||
    "Your order total includes shipping and applicable taxes. We will contact you with payment instructions shortly.";

  return (
    <section className="py-20">
      <Container className="max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-royal-blue/10 text-2xl text-royal-blue">
          ✓
        </div>
        <h1 className="heading-section">Order placed successfully</h1>
        <p className="mt-4 text-carbon">
          Thank you, {order.customer.firstName}! Your order <strong>{order.orderNumber}</strong> has been received.
        </p>

        <div className="mt-8 rounded-sm border border-chrome-light/60 bg-chrome-light/5 p-6 text-left text-sm">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal, order.currency)}</span>
          </p>
          <p className="mt-2 flex justify-between text-chrome-mid">
            <span>Shipping</span>
            <span>{formatCurrency(order.shippingCost, order.currency)}</span>
          </p>
          {order.shipping?.method && (
            <p className="mt-1 text-xs text-chrome-mid">{order.shipping.method}</p>
          )}
          <p className="mt-2 flex justify-between text-chrome-mid">
            <span>Tax</span>
            <span>{formatCurrency(order.tax, order.currency)}</span>
          </p>
          <p className="mt-3 flex justify-between border-t border-chrome-light/60 pt-3 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total, order.currency)}</span>
          </p>
          <p className="mt-3 flex justify-between text-chrome-mid">
            <span>Payment status</span>
            <span className="capitalize">{order.paymentStatus.replace(/_/g, " ")}</span>
          </p>
        </div>

        <p className="mt-6 text-sm text-carbon">{confirmationCopy}</p>

        <p className="mt-4 text-xs text-chrome-mid">
          A confirmation email has been sent to {order.customer.email}. Save this link to track your order.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/shop" className={buttonVariants("primary")}>Continue shopping</Link>
          <Link href="/contact" className={buttonVariants("secondary")}>Contact us</Link>
        </div>
      </Container>
    </section>
  );
}
