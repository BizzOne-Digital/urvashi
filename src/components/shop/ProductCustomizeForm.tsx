"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DESIGN_HELP_SURCHARGE, getProductDisplayImages } from "@/lib/product-catalog";
import { resolveImageSrc } from "@/lib/image-url";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
}

export function ProductCustomizeForm({ product }: ProductCustomizeFormProps) {
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

    setSubmitting(true);
    try {
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone || undefined,
          },
          productSlug: product.slug,
          productName: product.name,
          quantity: form.quantity,
          instructions: form.instructions || undefined,
          designHelp,
          artworkAssetIds: [artworkId],
          consentGiven: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");

      toast.success(json.message || "Request submitted!");
      router.push(`/shop/${product.slug}?submitted=1`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = "w-full rounded-sm border border-chrome-light bg-pure-paper px-3 py-2 text-sm";

  return (
    <Container className="max-w-5xl py-12">
      <nav className="mb-6 text-sm text-chrome-mid">
        <Link href="/shop" className="hover:text-royal-blue">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/shop/${product.slug}`} className="hover:text-royal-blue">
          {product.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-black">Customize</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="heading-section">Customize your {product.name.toLowerCase()}</h1>
          <p className="mt-3 text-carbon">
            Upload your image to preview it on the product, then submit your request. We will contact you to confirm
            before production.
          </p>

          <div className="relative mt-8 aspect-square overflow-hidden rounded-sm border border-chrome-light/40 bg-pure-paper">
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
            {product.customizer?.previewDisclaimer ||
              "Preview is approximate. Final placement may vary slightly."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-vibrant space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">First name</label>
              <input
                required
                className={fieldClass}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Last name</label>
              <input
                required
                className={fieldClass}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              required
              type="email"
              className={fieldClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone (optional)</label>
            <input
              className={fieldClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Quantity</label>
            <input
              type="number"
              min={product.minQuantity}
              className={cn(fieldClass, "w-28")}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value, 10) || product.minQuantity })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Upload your artwork</label>
            <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleUpload} disabled={uploading} />
            {uploading && <p className="mt-1 text-xs text-chrome-mid">Uploading…</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Special instructions (optional)</label>
            <textarea
              className={fieldClass}
              rows={3}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            />
          </div>

          <label className="flex items-start gap-3 rounded-sm border border-chrome-light/40 bg-pure-paper p-4 text-sm">
            <input
              type="checkbox"
              checked={designHelp}
              onChange={(e) => setDesignHelp(e.target.checked)}
              className="mt-1"
            />
            <span>
              <strong>Would you like us to design for better results?</strong>
              <br />
              Our team can refine your artwork and send 3–4 design options (+{formatCurrency(designFee, product.currency)}).
              Without design help, your upload is used as-is starting at {formatCurrency(basePrice, product.currency)} each.
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.rightsConfirmed}
              onChange={(e) => setForm({ ...form, rightsConfirmed: e.target.checked })}
              className="mt-1"
            />
            I confirm I have the rights to use this artwork for printing.
          </label>

          <div className="rounded-sm bg-royal-blue/5 p-4 text-sm">
            <p className="font-semibold text-ink-black">Estimated starting total</p>
            <p className="text-2xl font-bold text-royal-blue">{formatCurrency(estimatedTotal, product.currency)}</p>
            <p className="mt-1 text-chrome-mid">Final price confirmed after we review your request.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting || uploading}>
              {submitting ? "Submitting…" : "Submit customization request"}
            </Button>
            <Link href={`/shop/${product.slug}`} className={buttonVariants("secondary")}>
              Back to product
            </Link>
          </div>
        </form>
      </div>
    </Container>
  );
}
