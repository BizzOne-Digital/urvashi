"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
import { LocalImageField } from "@/components/admin/LocalImageField";
import {
  ProductPrintLocationsEditor,
  type PrintLocationDraft,
} from "@/components/admin/ProductPrintLocationsEditor";
import {
  ProductVariantsEditor,
  type ProductVariantDraft,
} from "@/components/admin/ProductVariantsEditor";
import { resolveImageSrc } from "@/lib/image-url";
import { countInStockOptions } from "@/lib/product-stock";
import { slugify } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface ProductFormValues {
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  longDescription?: string;
  pricingMode: "fixed" | "quote";
  price?: number;
  compareAtPrice?: number;
  currency: string;
  minQuantity: number;
  quantityStep: number;
  stock?: number;
  lowStockThreshold?: number;
  availability: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  onSale: boolean;
  tags?: string;
  seoTitle?: string;
  seoDescription?: string;
}

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductFormValues> & {
    categorySlug?: string;
    images?: Array<{ url: string; alt?: string }>;
    blankImage?: { url: string; alt?: string };
    customizedImage?: { url: string; alt?: string };
    cardImage?: { url: string; alt?: string };
    mockupFrontImage?: { url: string; alt?: string };
    mockupBackImage?: { url: string; alt?: string };
    variants?: ProductVariantDraft[];
    printLocations?: PrintLocationDraft[];
    allowsBlankPurchase?: boolean;
    allowsCustomization?: boolean;
    designHelpSurcharge?: number;
    lowStockThreshold?: number;
    customizer?: { enabled?: boolean; printArea?: { x: number; y: number; width: number; height: number } };
  };
}

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const isNew = !productId || productId === "new";
  const [images, setImages] = useState(initialData?.images || []);
  const [blankImage, setBlankImage] = useState(initialData?.blankImage);
  const [customizedImage, setCustomizedImage] = useState(initialData?.customizedImage);
  const [cardImage, setCardImage] = useState(initialData?.cardImage);
  const [mockupFrontImage, setMockupFrontImage] = useState(initialData?.mockupFrontImage);
  const [mockupBackImage, setMockupBackImage] = useState(initialData?.mockupBackImage);
  const [variants, setVariants] = useState<ProductVariantDraft[]>(initialData?.variants || []);
  const [printLocations, setPrintLocations] = useState<PrintLocationDraft[]>(
    initialData?.printLocations || []
  );
  const [categorySlug, setCategorySlug] = useState(initialData?.categorySlug || "");
  const [allowsBlankPurchase, setAllowsBlankPurchase] = useState(initialData?.allowsBlankPurchase ?? true);
  const [allowsCustomization, setAllowsCustomization] = useState(initialData?.allowsCustomization ?? true);
  const [designHelpSurcharge, setDesignHelpSurcharge] = useState(initialData?.designHelpSurcharge ?? 5);
  const [customizerEnabled, setCustomizerEnabled] = useState(initialData?.customizer?.enabled ?? true);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      sku: initialData?.sku || "",
      shortDescription: initialData?.shortDescription || "",
      longDescription: initialData?.longDescription || "",
      pricingMode: (initialData?.pricingMode as "fixed" | "quote") || "fixed",
      price: initialData?.price,
      compareAtPrice: initialData?.compareAtPrice,
      currency: initialData?.currency || "CAD",
      minQuantity: initialData?.minQuantity ?? 1,
      quantityStep: initialData?.quantityStep ?? 1,
      stock: initialData?.stock,
      lowStockThreshold: initialData?.lowStockThreshold ?? 5,
      availability: initialData?.availability || "in_stock",
      status: initialData?.status || "draft",
      featured: initialData?.featured ?? false,
      onSale: initialData?.onSale ?? false,
      tags: initialData?.tags || "",
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
    },
  });

  const name = watch("name");
  const pricingMode = watch("pricingMode");
  const stockCounts = countInStockOptions(variants);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("name", value);
    if (isNew) setValue("slug", slugify(value));
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!data.name || !data.sku) {
      toast.error("Name and SKU are required");
      return;
    }
    const payload = {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      shortDescription: data.shortDescription,
      longDescription: data.longDescription,
      pricingMode: data.pricingMode,
      price: data.pricingMode === "fixed" ? data.price : undefined,
      compareAtPrice: data.compareAtPrice,
      currency: data.currency,
      minQuantity: data.minQuantity,
      quantityStep: data.quantityStep,
      stock: data.stock,
      lowStockThreshold: data.lowStockThreshold,
      availability: data.availability,
      status: data.status,
      featured: data.featured,
      onSale: data.onSale,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      categorySlug: categorySlug || undefined,
      images,
      blankImage,
      customizedImage,
      cardImage,
      mockupFrontImage,
      mockupBackImage,
      allowsBlankPurchase,
      allowsCustomization,
      designHelpSurcharge,
      seo: { title: data.seoTitle, description: data.seoDescription },
      variants: variants
        .map((v) => ({
          name: v.name.trim(),
          options: v.options
            .filter((o) => o.label.trim() && o.value.trim())
            .map((o) => ({
              label: o.label.trim(),
              value: o.value.trim(),
              ...(o.surcharge != null ? { surcharge: o.surcharge } : {}),
              inStock: o.inStock !== false,
            })),
        }))
        .filter((v) => v.name && v.options.length > 0),
      printLocations: printLocations
        .filter((p) => p.id.trim() && p.label.trim())
        .map((p) => ({
          id: p.id.trim(),
          label: p.label.trim(),
          surcharge: p.surcharge ?? 0,
        })),
      customizationFields: [],
      optionSurcharges: [],
      customizer: {
        enabled: customizerEnabled,
        printArea: initialData?.customizer?.printArea || { x: 12, y: 18, width: 76, height: 58 },
        previewDisclaimer:
          "Preview is approximate. Final placement, colour, and sizing may vary from what is shown.",
      },
    };

    if (isNew) {
      const created = await adminFetch<{ _id: string }>("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(payload),
        successMessage: "Product created",
      });
      router.push(`/admin/products/${created._id}`);
    } else {
      await adminFetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        successMessage: "Product saved",
      });
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!productId || isNew) return;
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        successMessage: "Product deleted",
      });
      router.push("/admin/products");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Basic Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name">
            <input className={inputClass} {...register("name")} onChange={onNameChange} />
          </FormField>
          <FormField label="Slug">
            <input className={inputClass} {...register("slug")} />
          </FormField>
          <FormField label="SKU">
            <input className={inputClass} {...register("sku")} />
          </FormField>
          <FormField label="Category slug">
            <input
              className={inputClass}
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              placeholder="apparel, drinkware, gifts-keepsakes…"
            />
          </FormField>
          <FormField label="Status">
            <select className={selectClass} {...register("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>
          <FormField label="Short Description" className="sm:col-span-2">
            <textarea className={textareaClass} rows={2} {...register("shortDescription")} />
          </FormField>
          <FormField label="Long Description" className="sm:col-span-2">
            <textarea className={textareaClass} rows={6} {...register("longDescription")} />
          </FormField>
          <FormField label="Tags (comma-separated)" className="sm:col-span-2">
            <input className={inputClass} {...register("tags")} placeholder="gift, apparel, custom" />
          </FormField>
        </div>
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Pricing &amp; inventory</h2>
        <p className="mb-4 text-sm text-chrome-mid">
          Set overall availability and optional total quantity. Use variant options below to mark which
          colours or shapes are in stock.
          {stockCounts.total > 0 && (
            <span className="mt-1 block font-medium text-ink-black">
              Options in stock: {stockCounts.inStock} / {stockCounts.total}
            </span>
          )}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Pricing Mode">
            <select className={selectClass} {...register("pricingMode")}>
              <option value="fixed">Fixed Price</option>
              <option value="quote">Quote Only</option>
            </select>
          </FormField>
          {pricingMode === "fixed" && (
            <>
              <FormField label="Price">
                <input type="number" step="0.01" className={inputClass} {...register("price")} />
              </FormField>
              <FormField label="Compare At Price">
                <input type="number" step="0.01" className={inputClass} {...register("compareAtPrice")} />
              </FormField>
            </>
          )}
          <FormField label="Currency">
            <input className={inputClass} {...register("currency")} />
          </FormField>
          <FormField label="Min Quantity">
            <input type="number" className={inputClass} {...register("minQuantity")} />
          </FormField>
          <FormField label="Quantity Step">
            <input type="number" className={inputClass} {...register("quantityStep")} />
          </FormField>
          <FormField label="Total stock (optional)">
            <input
              type="number"
              className={inputClass}
              {...register("stock")}
              placeholder="Leave empty if not tracking count"
            />
          </FormField>
          <FormField label="Low stock alert below">
            <input type="number" className={inputClass} {...register("lowStockThreshold")} />
          </FormField>
          <FormField label="Availability">
            <select className={selectClass} {...register("availability")}>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="made_to_order">Made to Order</option>
              <option value="quote_only">Quote Only</option>
            </select>
          </FormField>
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("featured")} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("onSale")} />
              On Sale
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Print options &amp; surcharges</h2>
        <p className="mb-4 text-sm text-chrome-mid">
          Set the base price above for one-side print. Add rows below for front &amp; back (surcharge added at
          checkout).
        </p>
        <ProductPrintLocationsEditor value={printLocations} onChange={setPrintLocations} />
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Variants &amp; stock by option</h2>
        <p className="mb-4 text-sm text-chrome-mid">
          Colour, shape, or size options. Uncheck <strong>In stock</strong> to hide an option from the shop
          until you have it again.
        </p>
        <ProductVariantsEditor value={variants} onChange={setVariants} />
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Product images (MongoDB — survives deploy)</h2>
        <p className="mb-4 text-sm text-chrome-mid">
          Uploads are stored in the database and served from <code>/api/uploads/…</code>, not the disk.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <LocalImageField
            label="Customize preview — front"
            folder="products"
            value={mockupFrontImage?.url}
            onChange={(url) =>
              setMockupFrontImage(
                url ? { url, alt: mockupFrontImage?.alt || "Front mockup" } : undefined
              )
            }
          />
          <LocalImageField
            label="Customize preview — back"
            folder="products"
            value={mockupBackImage?.url}
            onChange={(url) =>
              setMockupBackImage(url ? { url, alt: mockupBackImage?.alt || "Back mockup" } : undefined)
            }
          />
          <LocalImageField
            label="Shop — blank / primary"
            folder="products"
            value={blankImage?.url}
            onChange={(url) =>
              setBlankImage(url ? { url, alt: blankImage?.alt || "Blank product" } : undefined)
            }
          />
          <LocalImageField
            label="Shop — customized example"
            folder="products"
            value={customizedImage?.url}
            onChange={(url) =>
              setCustomizedImage(url ? { url, alt: customizedImage?.alt || "Customized example" } : undefined)
            }
          />
          <LocalImageField
            label="Shop card image (optional)"
            folder="products"
            value={cardImage?.url}
            onChange={(url) =>
              setCardImage(url ? { url, alt: cardImage?.alt || "Product card" } : undefined)
            }
          />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowsBlankPurchase}
              onChange={(e) => setAllowsBlankPurchase(e.target.checked)}
            />
            Allow blank purchase (Add to cart)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowsCustomization}
              onChange={(e) => setAllowsCustomization(e.target.checked)}
            />
            Allow customization requests
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={customizerEnabled} onChange={(e) => setCustomizerEnabled(e.target.checked)} />
            Customizer enabled
          </label>
          <FormField label="Design help surcharge ($)">
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={designHelpSurcharge}
              onChange={(e) => setDesignHelpSurcharge(parseFloat(e.target.value) || 0)}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Extra gallery images</h2>
        <div className="mb-4 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative h-24 w-24 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageSrc(img.url)}
                alt={img.alt || ""}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                className="absolute right-1 top-1 rounded bg-ink-black/70 px-1.5 py-0.5 text-xs text-white"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <LocalImageField
          label="Add gallery image"
          folder="products"
          value={null}
          onChange={(url) => {
            if (url) setImages((prev) => [...prev, { url, alt: "" }]);
          }}
        />
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">SEO</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="SEO Title">
            <input className={inputClass} {...register("seoTitle")} />
          </FormField>
          <FormField label="SEO Description">
            <input className={inputClass} {...register("seoDescription")} />
          </FormField>
        </div>
      </div>

      <div className="flex justify-between">
        <div>
          {!isNew && (
            <Button type="button" variant="ghost" onClick={handleDelete} disabled={deleting} className="text-deep-magenta">
              {deleting ? "Deleting…" : "Delete Product"}
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
