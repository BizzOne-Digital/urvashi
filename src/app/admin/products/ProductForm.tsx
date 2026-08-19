"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { adminFetch, adminUpload } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
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
  initialData?: Partial<ProductFormValues> & { images?: Array<{ url: string; alt?: string }> };
}

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const isNew = !productId || productId === "new";
  const [images, setImages] = useState(initialData?.images || []);
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

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("name", value);
    if (isNew) setValue("slug", slugify(value));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const asset = await adminUpload(file, "products");
    setImages((prev) => [...prev, { url: asset.publicUrl, alt: asset.alt }]);
    toast.success("Image uploaded");
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
      availability: data.availability,
      status: data.status,
      featured: data.featured,
      onSale: data.onSale,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      images,
      seo: { title: data.seoTitle, description: data.seoDescription },
      variants: [],
      printLocations: [],
      customizationFields: [],
      optionSurcharges: [],
      customizer: { enabled: false },
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
        <h2 className="mb-4 text-lg font-semibold">Pricing & Inventory</h2>
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
          <FormField label="Stock">
            <input type="number" className={inputClass} {...register("stock")} />
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
        <h2 className="mb-4 text-lg font-semibold">Images</h2>
        <div className="mb-4 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative h-24 w-24 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt || ""} className="h-full w-full object-cover" />
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
        <input type="file" accept="image/*" onChange={handleImageUpload} />
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
