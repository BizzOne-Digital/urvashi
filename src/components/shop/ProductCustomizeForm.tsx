"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MonerisCheckout } from "@/components/payments/MonerisCheckout";
import { DESIGN_HELP_SURCHARGE, getProductDisplayImages } from "@/lib/product-catalog";
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
}

export function ProductCustomizeForm({ product, monerisMode = "qa" }: ProductCustomizeFormProps) {
  const router = useRouter();
  const { blank, customized } = getProductDisplayImages(product);
  const baseImage = resolveImageSrc(customized?.url || blank?.url);
  const printArea = product.customizer?.printArea || { x: 12, y: 18, width: 76, height: 58 };
  const designFee = product.designHelpSurcharge ?? DESIGN_HELP_SURCHARGE;
  const basePrice = product.price ?? 0;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [artworkId, setArtworkId] = useState<string | null>(null);
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.rightsConfirmed) {
      toast.error("Please confirm you have rights to use this artwork");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("rightsConfirmed", "true");
      body.append("customerNote", form.instructions);

      const res = await fetch("/api/upload/artwork", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setArtworkId(json.artwork.id);
      toast.success("Artwork uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artworkId) {
      toast.error("Please upload your artwork first");
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
      const res = await fetch("/api/customize/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          message: form.instructions,
          artworkAssetId: artworkId,
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
            Upload your image, pay now through Moneris, and we will contact you to confirm before production.
          </p>

          <div className="relative mt-8 aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#0a0c14]">
            <Image src={baseImage} alt={product.name} fill className="object-contain p-6" sizes="50vw" />
            {previewUrl && (
              <div
                className="absolute overflow-hidden rounded-sm border border-dashed border-royal-blue/50 bg-white/10"
                style={{
                  left: `${printArea.x}%`,
                  top: `${printArea.y}%`,
                  width: `${printArea.width}%`,
                  height: `${printArea.height}%`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Your artwork preview" className="h-full w-full object-contain" />
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

          <div>
            <label className="mb-1 block text-sm font-medium text-pure-paper">Upload your artwork</label>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="block w-full text-sm text-chrome-light file:mr-3 file:rounded-sm file:border-0 file:bg-cyan/20 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-cyan hover:file:bg-cyan/30"
            />
            {uploading && <p className="mt-1 text-xs text-chrome-mid">Uploading…</p>}
          </div>

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
            <input type="checkbox" checked={form.rightsConfirmed} onChange={(e) => setForm({ ...form, rightsConfirmed: e.target.checked })} className="mt-1 accent-cyan" />
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
          mode={monerisMode}
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
