"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AddressAutocomplete } from "@/components/checkout/AddressAutocomplete";
import { MonerisCheckout } from "@/components/payments/MonerisCheckout";
import { CANADIAN_PROVINCES, normalizeProvinceCode } from "@/lib/canadian-tax";
import {
  ArtworkMultiUpload,
  getArtworkImagePreviewUrls,
  getUploadedArtworkIds,
  type LocalArtworkFile,
  uploadArtworkItemsOnSubmit,
  uploadPendingArtworkItems,
} from "@/components/customize/ArtworkMultiUpload";
import {
  CalendarArtworkUpload,
  createEmptyCalendarSlots,
  getCalendarArtworkItems,
  getCalendarPreviewUrls,
} from "@/components/customize/CalendarArtworkUpload";
import { CalendarMockupPreview } from "@/components/customize/CalendarMockupPreview";
import { ProductMockupPreview } from "@/components/customize/ProductMockupPreview";
import {
  DEFAULT_ARTWORK_TRANSFORM,
  formatArtworkTransformNote,
  type ArtworkTransform,
} from "@/lib/artwork-transform";
import { CALENDAR_MONTH_COUNT, isCalendarProduct } from "@/lib/calendar-customize";
import { DESIGN_HELP_SURCHARGE, getProductDisplayImages } from "@/lib/product-catalog";
import { getProductMockupConfig } from "@/lib/product-mockup-config";
import { resolveImageSrc } from "@/lib/image-url";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type MonerisEnvironment = "qa" | "prod";

interface ProductCustomizeFormProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price?: number;
    currency?: string;
    minQuantity: number;
    designHelpSurcharge?: number;
    blankImage?: { url: string; alt?: string };
    customizedImage?: { url: string; alt?: string };
    images?: Array<{ url: string; alt?: string }>;
    customizer?: {
      printArea?: { x: number; y: number; width: number; height: number };
      previewDisclaimer?: string;
    };
  };
  monerisMode?: MonerisEnvironment;
}

interface PendingMonerisPayment {
  ticket: string;
  referenceNumber: string;
  mode: MonerisEnvironment;
}

interface CustomizeRateSummary {
  rates: Array<{ id: string; label: string; description: string; price: number; currency: string }>;
  subtotal: number;
  designFee: number;
  shippingCost: number;
  tax: number;
  taxLabel?: string;
  total: number;
  currency: string;
}

export function ProductCustomizeForm({ product, monerisMode = "qa" }: ProductCustomizeFormProps) {
  const router = useRouter();
  const { blank, customized } = getProductDisplayImages(product);
  const baseImage = resolveImageSrc(blank?.url || customized?.url);
  const mockupConfig = getProductMockupConfig(product.slug, product.customizer?.printArea);
  const designFee = product.designHelpSurcharge ?? DESIGN_HELP_SURCHARGE;
  const basePrice = product.price ?? 0;
  const isCalendar = isCalendarProduct(product.slug);

  const [artworkItems, setArtworkItems] = useState<LocalArtworkFile[]>([]);
  const [artworkTransform, setArtworkTransform] = useState<ArtworkTransform>(DEFAULT_ARTWORK_TRANSFORM);
  const [calendarSlots, setCalendarSlots] = useState(createEmptyCalendarSlots);
  const [previewMonth, setPreviewMonth] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [designHelp, setDesignHelp] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingMonerisPayment | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [rateSummary, setRateSummary] = useState<CustomizeRateSummary | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    quantity: product.minQuantity || 1,
    address1: "",
    city: "",
    province: "",
    postalCode: "",
    shippingMethod: "",
    instructions: "",
    rightsConfirmed: false,
  });

  const merchandiseTotal = useMemo(
    () => basePrice * form.quantity + (designHelp ? designFee : 0),
    [basePrice, form.quantity, designHelp, designFee]
  );

  const displayTotal = rateSummary?.total ?? merchandiseTotal;

  useEffect(() => {
    setArtworkTransform(DEFAULT_ARTWORK_TRANSFORM);
  }, [artworkItems.map((item) => item.key).join("|")]);

  const fetchRates = useCallback(
    async (postal: string, prov: string, method?: string) => {
      const normalized = postal.replace(/\s/g, "");
      if (normalized.length < 6) {
        setRateSummary(null);
        return;
      }

      setRatesLoading(true);
      try {
        const res = await fetch("/api/customize/shipping-rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productSlug: product.slug,
            quantity: form.quantity,
            preferDesign: designHelp,
            postalCode: postal,
            province: prov || undefined,
            shippingMethod: method || undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load shipping rates");
        if (!json.rates?.length) throw new Error("No shipping options available for this postal code");

        setRateSummary(json);
        if (json.selectedMethod) {
          setForm((prev) => ({ ...prev, shippingMethod: json.selectedMethod }));
        }
      } catch (err) {
        setRateSummary(null);
        toast.error(err instanceof Error ? err.message : "Shipping rates unavailable");
      } finally {
        setRatesLoading(false);
      }
    },
    [product.slug, form.quantity, designHelp]
  );

  useEffect(() => {
    const normalized = form.postalCode.replace(/\s/g, "");
    if (normalized.length < 6) {
      setRateSummary(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchRates(form.postalCode, form.province, form.shippingMethod || undefined);
    }, 400);

    return () => clearTimeout(timer);
  }, [form.postalCode, form.province, form.shippingMethod, designHelp, form.quantity, fetchRates]);

  const removeArtwork = (key: string) => {
    const target = artworkItems.find((item) => item.key === key);
    if (target) URL.revokeObjectURL(target.previewUrl);
    setArtworkItems(artworkItems.filter((item) => item.key !== key));
  };

  const handleRightsChange = async (checked: boolean) => {
    setForm((prev) => ({ ...prev, rightsConfirmed: checked }));
    if (!checked) return;

    const hasArtwork = isCalendar
      ? getCalendarArtworkItems(calendarSlots).length > 0
      : artworkItems.length > 0;
    if (!hasArtwork) return;

    setUploading(true);
    try {
      if (isCalendar) {
        const items = getCalendarArtworkItems(calendarSlots);
        const uploaded = await uploadPendingArtworkItems(items, form.instructions);
        const uploadedByKey = new Map(uploaded.map((item) => [item.key, item]));
        setCalendarSlots(
          calendarSlots.map((slot) => (slot ? uploadedByKey.get(slot.key) || slot : null))
        );
      } else {
        const uploaded = await uploadPendingArtworkItems(artworkItems, form.instructions);
        setArtworkItems(uploaded);
      }
      toast.success("Artwork uploaded");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCalendar) {
      const filledMonths = getCalendarArtworkItems(calendarSlots);
      if (filledMonths.length < CALENDAR_MONTH_COUNT) {
        toast.error(`Please upload all ${CALENDAR_MONTH_COUNT} monthly photos (January–December)`);
        return;
      }
    } else if (!artworkItems.length) {
      toast.error("Please upload at least one artwork file");
      return;
    }
    if (!form.rightsConfirmed) {
      toast.error("Please confirm artwork rights");
      return;
    }
    if (designHelp && !form.instructions.trim()) {
      toast.error("Please describe what you want in your design");
      return;
    }
    if (!form.address1.trim() || !form.city.trim() || !form.province.trim()) {
      toast.error("Please complete your shipping address");
      return;
    }
    if (!rateSummary || !form.shippingMethod) {
      toast.error("Please wait for shipping and tax to be calculated");
      return;
    }

    setSubmitting(true);
    try {
      const itemsToUpload = isCalendar ? getCalendarArtworkItems(calendarSlots) : artworkItems;
      const { artworkIds } = await uploadArtworkItemsOnSubmit(
        itemsToUpload,
        form.rightsConfirmed,
        form.instructions
      );

      const calendarNote = isCalendar
        ? "Desk calendar — monthly photos uploaded in order from January through December."
        : undefined;
      const placementNote =
        !isCalendar && artworkItems.length === 1
          ? formatArtworkTransformNote(artworkTransform)
          : undefined;

      const res = await fetch("/api/customize/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          message: [calendarNote, placementNote, form.instructions].filter(Boolean).join("\n\n"),
          artworkAssetIds: artworkIds,
          preferDesign: designHelp,
          productSlug: product.slug,
          productName: product.name,
          quantity: form.quantity,
          shipping: {
            address1: form.address1,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode,
            country: "Canada",
            method: form.shippingMethod,
          },
          consentGiven: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");

      if (json.monerisTicket) {
        setPendingPayment({
          ticket: json.monerisTicket,
          referenceNumber: json.referenceNumber,
          mode: json.monerisMode === "prod" ? "prod" : monerisMode,
        });
        return;
      }

      throw new Error("Payment could not be started");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMonerisComplete = async (ticket: string) => {
    if (!pendingPayment) return;

    try {
      const res = await fetch("/api/customize/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket,
          referenceNumber: pendingPayment.referenceNumber,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Payment confirmation failed");

      setPendingPayment(null);
      router.push(`/customize/success?ref=${pendingPayment.referenceNumber}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment confirmation failed");
    }
  };

  const fieldClass =
    "w-full rounded-sm border border-white/15 bg-[#12141c] px-3 py-2 text-sm text-pure-paper placeholder:text-chrome-mid focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/25";

  return (
    <section className="border-b border-white/10 bg-[#050508] py-12 lg:py-16">
    <Container className="max-w-5xl">
      <nav className="mb-6 text-sm text-chrome-mid">
        <Link href="/shop" className="text-chrome-light hover:text-cyan">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop/${product.slug}`} className="text-chrome-light hover:text-cyan">{product.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-pure-paper">Customize</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="heading-section text-pure-paper">Customize your {product.name.toLowerCase()}</h1>
          <p className="mt-3 text-chrome-light">
            {isCalendar
              ? "Upload 12 photos — one for each month — and preview how your desk calendar will look before you pay."
              : "Upload your image to see it on the product. Drag to reposition and use the zoom slider to adjust before you pay."}
          </p>

          {isCalendar ? (
            <CalendarMockupPreview
              productName={product.name}
              baseImageSrc={baseImage}
              monthImageUrls={getCalendarPreviewUrls(calendarSlots)}
              selectedMonth={previewMonth}
              onSelectMonth={setPreviewMonth}
              disclaimer={
                product.customizer?.previewDisclaimer ||
                "Rough draft only — final placement, colour, and sizing may vary slightly."
              }
            />
          ) : (
            <>
              <ProductMockupPreview
                productName={product.name}
                baseImageSrc={baseImage}
                artworkUrls={getArtworkImagePreviewUrls(artworkItems)}
                printArea={mockupConfig.printArea}
                roundedPrintArea={mockupConfig.rounded}
                borderRadius={mockupConfig.borderRadius}
                interactive
                artworkTransform={artworkTransform}
                onArtworkTransformChange={setArtworkTransform}
                disclaimer={
                  product.customizer?.previewDisclaimer ||
                  "Rough draft only — final placement, colour, and sizing may vary slightly."
                }
              />

              {artworkItems.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {artworkItems.map((item) => (
                    <div key={item.key} className="relative overflow-hidden rounded-md border border-white/10 bg-[#0a0c14]">
                      {item.file.type.startsWith("image/") ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.previewUrl} alt={item.file.name} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center p-1 text-center text-[9px] text-chrome-mid">
                          PDF
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeArtwork(item.key)}
                        className="absolute right-0.5 top-0.5 rounded bg-black/75 px-1 text-[9px] text-pure-paper"
                        aria-label={`Remove ${item.file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-white/10 bg-[#0a0c14] p-6 shadow-[0_0_40px_rgba(6,94,229,0.12)]"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-pure-paper">First name</label>
              <input required className={fieldClass} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-pure-paper">Last name</label>
              <input required className={fieldClass} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-pure-paper">Email</label>
            <input required type="email" className={fieldClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-pure-paper">Phone</label>
            <input required className={fieldClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-pure-paper">Quantity</label>
            <input
              type="number"
              min={product.minQuantity}
              className={cn(fieldClass, "w-28")}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value, 10) || product.minQuantity })}
            />
          </div>

          {isCalendar ? (
            <CalendarArtworkUpload
              slots={calendarSlots}
              onChange={setCalendarSlots}
              rightsConfirmed={form.rightsConfirmed}
              customerNote={form.instructions}
              onMonthFocus={setPreviewMonth}
            />
          ) : (
            <ArtworkMultiUpload
              items={artworkItems}
              onChange={setArtworkItems}
              rightsConfirmed={form.rightsConfirmed}
              customerNote={form.instructions}
              label="Upload your artwork"
              hint="PNG, JPEG, or PDF — add multiple images for collages."
              hidePreviews
            />
          )}
          {uploading && <p className="text-xs text-chrome-mid">Uploading…</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-pure-paper">
              Special instructions {designHelp ? "(required)" : "(optional)"}
            </label>
            <textarea className={fieldClass} rows={3} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-cyan/25 bg-cyan/5 p-4 text-sm text-pure-paper">
            <input type="checkbox" checked={designHelp} onChange={(e) => setDesignHelp(e.target.checked)} className="mt-1 accent-cyan" />
            <span>
              <strong>I prefer your design</strong>
              <br />
              <span className="text-chrome-light">
                Our team will create 2–3 design options (+{formatCurrency(designFee, product.currency)}).
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm text-chrome-light">
            <input type="checkbox" checked={form.rightsConfirmed} onChange={(e) => handleRightsChange(e.target.checked)} className="mt-1 accent-cyan" />
            I confirm I have the rights to use this artwork for printing.
          </label>

          <h2 className="font-display text-lg font-semibold text-pure-paper pt-2">Shipping address</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-pure-paper">Address line 1</label>
            <AddressAutocomplete
              id="customize-address1"
              value={form.address1}
              cityHint={form.city}
              onChange={(value) => setForm((prev) => ({ ...prev, address1: value }))}
              onAddressSelect={(addr) => {
                setForm((prev) => ({
                  ...prev,
                  address1: addr.address1,
                  city: addr.city || prev.city,
                  province: addr.province ? normalizeProvinceCode(addr.province) || addr.province : prev.province,
                  postalCode: addr.postalCode || prev.postalCode,
                }));
              }}
              className={fieldClass}
              placeholder="e.g. 28 Sinclair St"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-pure-paper">City</label>
              <input required className={fieldClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-pure-paper">Province</label>
              <select required className={fieldClass} value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                <option value="">Select province</option>
                {CANADIAN_PROVINCES.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-pure-paper">Postal code</label>
              <input required className={fieldClass} value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
            </div>
          </div>

          <h2 className="font-display text-lg font-semibold text-pure-paper">Delivery method</h2>
          {ratesLoading && <p className="text-sm text-chrome-mid">Calculating Canada Post rates…</p>}
          <div className="space-y-3">
            {(rateSummary?.rates || []).map((rate) => (
              <label
                key={rate.id}
                className={`flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors ${
                  form.shippingMethod === rate.id
                    ? "border-cyan bg-cyan/10"
                    : "border-white/10 hover:border-cyan/40"
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={rate.id}
                  checked={form.shippingMethod === rate.id}
                  className="mt-1"
                  onChange={() => {
                    setForm((prev) => ({ ...prev, shippingMethod: rate.id }));
                    fetchRates(form.postalCode, form.province, rate.id);
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-pure-paper">{rate.label}</p>
                  <p className="text-sm text-chrome-mid">{rate.description}</p>
                </div>
                <span className="shrink-0 font-semibold text-pure-paper">
                  {rate.price === 0 ? "Free" : formatCurrency(rate.price, rate.currency)}
                </span>
              </label>
            ))}
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
            <p className="font-semibold text-pure-paper">Order total</p>
            <div className="mt-3 space-y-2 text-chrome-light">
              <p className="flex justify-between">
                <span>Product</span>
                <span>{formatCurrency(rateSummary?.subtotal ?? basePrice * form.quantity, product.currency)}</span>
              </p>
              {designHelp && (
                <p className="flex justify-between">
                  <span>Design service</span>
                  <span>{formatCurrency(rateSummary?.designFee ?? designFee, product.currency)}</span>
                </p>
              )}
              <p className="flex justify-between">
                <span>Shipping</span>
                <span>{rateSummary ? formatCurrency(rateSummary.shippingCost, rateSummary.currency) : "—"}</span>
              </p>
              <p className="flex justify-between">
                <span>{rateSummary?.taxLabel || "Tax"}</span>
                <span>{rateSummary ? formatCurrency(rateSummary.tax, rateSummary.currency) : "—"}</span>
              </p>
              <p className="flex justify-between border-t border-white/10 pt-2 text-lg font-bold text-cyan">
                <span>Total due today</span>
                <span>{formatCurrency(displayTotal, product.currency)}</span>
              </p>
            </div>
            {!rateSummary && form.postalCode.replace(/\s/g, "").length >= 6 && !ratesLoading && (
              <p className="mt-2 text-xs text-chrome-mid">Enter your address and postal code to calculate shipping and tax.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting || uploading || ratesLoading || !rateSummary}>
              {submitting || uploading ? "Processing…" : `Pay ${formatCurrency(displayTotal, product.currency)} now`}
            </Button>
            <Link href={`/shop/${product.slug}`} className={buttonVariants("secondary")}>Back to product</Link>
          </div>
        </form>
      </div>

      {pendingPayment && (
        <MonerisCheckout
          ticket={pendingPayment.ticket}
          mode={pendingPayment.mode}
          onComplete={handleMonerisComplete}
          onCancel={() => {
            setPendingPayment(null);
            toast.message("Payment cancelled. You can try again when ready.");
          }}
          onError={(message) => toast.error(message)}
        />
      )}
    </Container>
    </section>
  );
}
