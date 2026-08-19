"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { CalculatedLineItem } from "@/lib/pricing";

const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  address1: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  customerNotes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  manualInvoiceInstructions?: string;
}

export function CheckoutForm({ manualInvoiceInstructions }: CheckoutFormProps) {
  const router = useRouter();
  const [cart, setCart] = useState<{
    items: CalculatedLineItem[];
    fixedSubtotal: number;
    currency: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: "Canada" },
  });

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCart(d.cart))
      .catch(() => setCart(null));
  }, []);

  const onSubmit = async (data: CheckoutFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          },
          shipping: {
            address1: data.address1,
            city: data.city,
            province: data.province,
            postalCode: data.postalCode,
            country: data.country,
          },
          customerNotes: data.customerNotes,
          paymentMethod: "manual_invoice",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");
      router.push(`/order/success?orderNumber=${json.orderNumber}&token=${json.accessToken}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = "w-full rounded-sm border border-chrome-light bg-pure-paper px-4 py-3 text-sm";

  if (!cart) return <p className="text-chrome-mid">Loading checkout…</p>;

  if (cart.items.length === 0) {
    return (
      <div className="text-center">
        <p className="text-carbon">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary mt-4 inline-flex">Shop products</Link>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-10 lg:grid-cols-3">
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-0 space-y-5 lg:col-span-2">
        <h2 className="font-display text-xl font-semibold">Customer details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium">First name</label>
            <input id="firstName" {...register("firstName")} className={fieldClass} />
            {errors.firstName && <p className="mt-1 text-xs text-deep-magenta">{errors.firstName.message}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium">Last name</label>
            <input id="lastName" {...register("lastName")} className={fieldClass} />
            {errors.lastName && <p className="mt-1 text-xs text-deep-magenta">{errors.lastName.message}</p>}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="email" type="email" {...register("email")} className={fieldClass} />
            {errors.email && <p className="mt-1 text-xs text-deep-magenta">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone</label>
            <input id="phone" {...register("phone")} className={fieldClass} />
          </div>
        </div>

        <h2 className="font-display text-xl font-semibold pt-4">Shipping (optional)</h2>
        <input placeholder="Address" {...register("address1")} className={fieldClass} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input placeholder="City" {...register("city")} className={fieldClass} />
          <input placeholder="Province" {...register("province")} className={fieldClass} />
          <input placeholder="Postal code" {...register("postalCode")} className={fieldClass} />
        </div>

        <div>
          <label htmlFor="customerNotes" className="mb-1 block text-sm font-medium">Order notes</label>
          <textarea id="customerNotes" rows={3} {...register("customerNotes")} className={fieldClass} />
        </div>

        {manualInvoiceInstructions && (
          <p className="rounded-sm border border-royal-blue/30 bg-royal-blue/5 p-4 text-sm text-carbon">
            {manualInvoiceInstructions}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? "Placing order…" : "Place order (manual invoice)"}
        </Button>
      </form>

      <div className="rounded-sm border border-chrome-light/60 bg-chrome-light/5 p-6 h-fit">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {cart.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span className="min-w-0 break-words">{item.productName} × {item.quantity}</span>
              <span>{formatCurrency(item.lineTotal, cart.currency)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-chrome-light/60 pt-4 font-semibold">
          <span>Subtotal</span>
          <span>{formatCurrency(cart.fixedSubtotal, cart.currency)}</span>
        </p>
        <p className="mt-2 text-xs text-chrome-mid">Shipping and taxes will be confirmed on your invoice.</p>
      </div>
    </div>
  );
}
