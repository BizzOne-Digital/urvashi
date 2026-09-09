"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MonerisCheckout } from "@/components/payments/MonerisCheckout";
import {
  ArtworkMultiUpload,
  getUploadedArtworkIds,
  type LocalArtworkFile,
  uploadArtworkItemsOnSubmit,
  uploadPendingArtworkItems,
} from "@/components/customize/ArtworkMultiUpload";
import { DESIGN_HELP_SURCHARGE } from "@/lib/product-catalog";
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

export function ProductCustomizeForm({ product, monerisMode = "qa" }: ProductCustomizeFormProps) {
  const router = useRouter();
  const designFee = product.designHelpSurcharge ?? DESIGN_HELP_SURCHARGE;
  const basePrice = product.price ?? 0;

  const [artworkItems, setArtworkItems] = useState<LocalArtworkFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [designHelp, setDesignHelp] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingMonerisPayment | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    quantity: product.minQuantity || 1,
    instructions: "",
    rightsConfirmed: false,
  });

  const estimatedTotal = useMemo(
    () => basePrice * form.quantity + (designHelp ? designFee : 0),
    [basePrice, form.quantity, designHelp, designFee]
  );

  const removeArtwork = (key: string) => {
    const target = artworkItems.find((item) => item.key === key);
    if (target) URL.revokeObjectURL(target.previewUrl);
    setArtworkItems(artworkItems.filter((item) => item.key !== key));
  };

  const handleRightsChange = async (checked: boolean) => {
    setForm((prev) => ({ ...prev, rightsConfirmed: checked }));
    if (!checked || !artworkItems.length) return;

    setUploading(true);
    try {
      const uploaded = await uploadPendingArtworkItems(artworkItems, form.instructions);
      setArtworkItems(uploaded);
      if (getUploadedArtworkIds(uploaded).length) {
        toast.success("Artwork uploaded");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artworkItems.length) {
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

    setSubmitting(true);
    try {
      const { artworkIds } = await uploadArtworkItemsOnSubmit(
        artworkItems,
        form.rightsConfirmed,
        form.instructions
      );

      const res = await fetch("/api/customize/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          message: form.instructions,
          artworkAssetIds: artworkIds,
          preferDesign: designHelp,
          productSlug: product.slug,
          productName: product.name,
          quantity: form.quantity,
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
            Upload your images (add multiple for collages), pay now through Moneris, and we will contact you to confirm before production.
          </p>

          <div className="relative mt-8 min-h-[280px] overflow-hidden rounded-xl border border-white/10 bg-[#0a0c14] p-4">
            {artworkItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {artworkItems.map((item) => (
                  <div key={item.key} className="relative overflow-hidden rounded-lg border border-white/10 bg-[#050508]">
                    {item.file.type.startsWith("image/") ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="aspect-square w-full object-contain p-3"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center p-3 text-center text-xs text-chrome-light">
                        {item.file.name}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeArtwork(item.key)}
                      className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-pure-paper hover:bg-black"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 p-8 text-center">
                <p className="text-sm text-chrome-light">Your artwork preview will appear here</p>
                <p className="text-xs text-chrome-mid">Upload one or more images using the form on the right</p>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-chrome-mid">
            {product.customizer?.previewDisclaimer || "Preview is approximate. Final placement may vary slightly."}
          </p>
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

          <ArtworkMultiUpload
            items={artworkItems}
            onChange={setArtworkItems}
            rightsConfirmed={form.rightsConfirmed}
            customerNote={form.instructions}
            label="Upload your artwork"
            hint="PNG, JPEG, or PDF — add multiple images for collages."
            hidePreviews
          />
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

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
            <p className="font-semibold text-pure-paper">Total due today</p>
            <p className="text-2xl font-bold text-cyan">{formatCurrency(estimatedTotal, product.currency)}</p>
            <p className="mt-1 text-chrome-mid">
              Includes customization starting at {formatCurrency(basePrice, product.currency)} each
              {designHelp ? ` plus ${formatCurrency(designFee, product.currency)} design service` : ""}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting || uploading}>
              {submitting || uploading ? "Processing…" : `Pay ${formatCurrency(estimatedTotal, product.currency)} now`}
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
