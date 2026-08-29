"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AddressAutocomplete } from "@/components/checkout/AddressAutocomplete";
import { formatCurrency } from "@/lib/utils";
import type { CalculatedLineItem } from "@/lib/pricing";

interface ShippingRate {
  id: string;
  label: string;
  description: string;
  price: number;
  currency: string;
  estimatedDays?: string;
  tracked: boolean;
}

interface RateSummary {
  rates: ShippingRate[];
  selectedMethod?: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  taxLabel?: string;
  total: number;
  currency: string;
}

const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  address1: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(6, "Postal code is required"),
  country: z.string().optional(),
  shippingMethod: z.string().min(1, "Select a shipping method"),
  customerNotes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  pickupEnabled?: boolean;
}

export function CheckoutForm({ pickupEnabled = false }: CheckoutFormProps) {
  const router = useRouter();
  const [cart, setCart] = useState<{
    items: CalculatedLineItem[];
    fixedSubtotal: number;
    currency: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [rateSummary, setRateSummary] = useState<RateSummary | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: "Canada" },
  });

  const address1 = watch("address1") || "";
  const postalCode = watch("postalCode") || "";
  const province = watch("province") || "";
  const shippingMethod = watch("shippingMethod") || "";

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCart(d.cart))
      .catch(() => setCart(null));
  }, []);

  const fetchRates = useCallback(
    async (postal: string, prov: string, method?: string) => {
      const normalized = postal.replace(/\s/g, "");
      if (normalized.length < 6) {
        setRateSummary(null);
        return;
      }

      setRatesLoading(true);
      try {
        const res = await fetch("/api/shipping/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postalCode: postal,
            province: prov,
            shippingMethod: method || undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load shipping rates");

        setRateSummary(json);
        if (json.selectedMethod) {
          setValue("shippingMethod", json.selectedMethod, { shouldValidate: true });
        }
      } catch (err) {
        setRateSummary(null);
        toast.error(err instanceof Error ? err.message : "Shipping rates unavailable");
      } finally {
        setRatesLoading(false);
      }
    },
    [setValue]
  );

  useEffect(() => {
    const normalized = postalCode.replace(/\s/g, "");
    if (normalized.length < 6 || !province.trim()) return;

    const timer = setTimeout(() => {
      fetchRates(postalCode, province, shippingMethod || undefined);
    }, 400);

    return () => clearTimeout(timer);
  }, [postalCode, province, fetchRates, shippingMethod]);

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
            method: data.shippingMethod,
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

  const fieldClass =
    "w-full rounded-sm border border-chrome-light bg-pure-paper px-4 py-3 text-sm";

  if (!cart) return <p className="text-chrome-mid">Loading checkout…</p>;

  if (cart.items.length === 0) {
    return (
      <div className="text-center">
        <p className="text-carbon">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary mt-4 inline-flex">Shop products</Link>
      </div>
    );
  }

  const displaySummary = rateSummary || {
    subtotal: cart.fixedSubtotal,
    shippingCost: 0,
    tax: 0,
    total: cart.fixedSubtotal,
    currency: cart.currency,
    rates: [],
  };

  return (
    <div className="grid min-w-0 gap-10 lg:grid-cols-3">
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-0 space-y-5 lg:col-span-2">
        <h2 className="font-display text-xl font-semibold">Customer details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium">First name</label>
            <input id="firstName" {...register("firstName")} className={fieldClass} />
            {errors.firstName && (
              <p className="mt-1 text-xs text-deep-magenta">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium">Last name</label>
            <input id="lastName" {...register("lastName")} className={fieldClass} />
            {errors.lastName && (
              <p className="mt-1 text-xs text-deep-magenta">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="email" type="email" {...register("email")} className={fieldClass} />
            {errors.email && (
              <p className="mt-1 text-xs text-deep-magenta">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone</label>
            <input id="phone" {...register("phone")} className={fieldClass} />
          </div>
        </div>

        <h2 className="font-display text-xl font-semibold pt-4">Shipping address</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Street address</label>
          <AddressAutocomplete
            value={address1}
            onChange={(v) => setValue("address1", v, { shouldValidate: true })}
            onAddressSelect={(addr) => {
              setValue("address1", addr.address1, { shouldValidate: true });
              if (addr.city) setValue("city", addr.city, { shouldValidate: true });
              if (addr.province) setValue("province", addr.province, { shouldValidate: true });
              if (addr.postalCode) setValue("postalCode", addr.postalCode, { shouldValidate: true });
              if (addr.country) setValue("country", addr.country);
            }}
            className={fieldClass}
            placeholder="Start typing your address…"
          />
          {errors.address1 && (
            <p className="mt-1 text-xs text-deep-magenta">{errors.address1.message}</p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <input placeholder="City" {...register("city")} className={fieldClass} />
            {errors.city && (
              <p className="mt-1 text-xs text-deep-magenta">{errors.city.message}</p>
            )}
          </div>
          <div>
            <input placeholder="Province" {...register("province")} className={fieldClass} />
            {errors.province && (
              <p className="mt-1 text-xs text-deep-magenta">{errors.province.message}</p>
            )}
          </div>
          <div>
            <input placeholder="Postal code" {...register("postalCode")} className={fieldClass} />
            {errors.postalCode && (
              <p className="mt-1 text-xs text-deep-magenta">{errors.postalCode.message}</p>
            )}
          </div>
        </div>

        <h2 className="font-display text-xl font-semibold pt-4">Delivery method</h2>
        {ratesLoading && (
          <p className="text-sm text-chrome-mid">Calculating Canada Post rates…</p>
        )}
        {!ratesLoading && displaySummary.rates.length === 0 && postalCode.replace(/\s/g, "").length >= 6 && (
          <p className="text-sm text-chrome-mid">Enter a valid postal code to see shipping options.</p>
        )}
        <div className="space-y-3">
          {displaySummary.rates.map((rate) => (
            <label
              key={rate.id}
              className={`flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors ${
                shippingMethod === rate.id
                  ? "border-royal-blue bg-royal-blue/5"
                  : "border-chrome-light/60 hover:border-chrome-light"
              }`}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={rate.id}
                checked={shippingMethod === rate.id}
                className="mt-1"
                onChange={() => {
                  setValue("shippingMethod", rate.id, { shouldValidate: true });
                  fetchRates(postalCode, province, rate.id);
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-carbon">
                  {rate.label}
                  {rate.tracked && (
                    <span className="ml-2 text-xs font-normal text-royal-blue">Tracking included</span>
                  )}
                </p>
                <p className="text-sm text-chrome-mid">{rate.description}</p>
                {rate.estimatedDays && (
                  <p className="text-xs text-chrome-mid">{rate.estimatedDays}</p>
                )}
              </div>
              <span className="shrink-0 font-semibold">
                {rate.price === 0
                  ? "Free"
                  : formatCurrency(rate.price, rate.currency)}
              </span>
            </label>
          ))}
        </div>
        {errors.shippingMethod && (
          <p className="text-xs text-deep-magenta">{errors.shippingMethod.message}</p>
        )}

        <div>
          <label htmlFor="customerNotes" className="mb-1 block text-sm font-medium">Order notes</label>
          <textarea id="customerNotes" rows={3} {...register("customerNotes")} className={fieldClass} />
        </div>

        <Button
          type="submit"
          disabled={submitting || ratesLoading || !rateSummary}
          className="w-full sm:w-auto"
        >
          {submitting ? "Placing order…" : "Place order"}
        </Button>
        {!rateSummary && postalCode.replace(/\s/g, "").length >= 6 && !ratesLoading && (
          <p className="text-xs text-chrome-mid">
            Complete your address to calculate shipping and taxes before placing your order.
          </p>
        )}
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
        <div className="mt-4 space-y-2 border-t border-chrome-light/60 pt-4 text-sm">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(displaySummary.subtotal, displaySummary.currency)}</span>
          </p>
          <p className="flex justify-between text-chrome-mid">
            <span>Shipping</span>
            <span>
              {rateSummary
                ? formatCurrency(displaySummary.shippingCost, displaySummary.currency)
                : "—"}
            </span>
          </p>
          <p className="flex justify-between text-chrome-mid">
            <span>{rateSummary?.taxLabel || "Tax"}</span>
            <span>
              {rateSummary
                ? formatCurrency(displaySummary.tax, displaySummary.currency)
                : "—"}
            </span>
          </p>
          <p className="flex justify-between border-t border-chrome-light/60 pt-2 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(displaySummary.total, displaySummary.currency)}</span>
          </p>
        </div>
        <p className="mt-3 text-xs text-chrome-mid">
          Shipping via Canada Post with tracking. Taxes calculated for your province.
        </p>
      </div>
    </div>
  );
}
