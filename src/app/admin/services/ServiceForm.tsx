"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { adminFetch, adminUpload } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
import { slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ServiceFormData {
  title: string;
  slug: string;
  shortDescription?: string;
  icon?: string;
  accentColor?: string;
  ctaText?: string;
  ctaUrl?: string;
  order: number;
  status: "draft" | "published" | "archived";
  heroHeading?: string;
  heroSubheading?: string;
  overview?: string;
  artworkGuidance?: string;
  pricingNote?: string;
  minimumOrderNote?: string;
  importantNotes?: string;
  detailCtaText?: string;
  detailCtaUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
}

interface ServiceFormProps {
  serviceId?: string;
  initialData?: Partial<ServiceFormData> & {
    cardImage?: { url: string; alt?: string };
    heroImage?: { url: string; alt?: string };
    suitableUses?: string[];
    productOptions?: string[];
    customizationOptions?: string[];
  };
}

export function ServiceForm({ serviceId, initialData }: ServiceFormProps) {
  const router = useRouter();
  const isNew = !serviceId || serviceId === "new";
  const [activeTab, setActiveTab] = useState<"card" | "detail">("card");
  const [cardImage, setCardImage] = useState(initialData?.cardImage);
  const [heroImage, setHeroImage] = useState(initialData?.heroImage);
  const [suitableUses, setSuitableUses] = useState((initialData?.suitableUses || []).join("\n"));
  const [productOptions, setProductOptions] = useState((initialData?.productOptions || []).join("\n"));
  const [customizationOptions, setCustomizationOptions] = useState(
    (initialData?.customizationOptions || []).join("\n")
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<ServiceFormData>({
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      shortDescription: initialData?.shortDescription || "",
      icon: initialData?.icon || "",
      accentColor: initialData?.accentColor || "#065EE5",
      ctaText: initialData?.ctaText || "",
      ctaUrl: initialData?.ctaUrl || "",
      order: initialData?.order ?? 0,
      status: (initialData?.status as ServiceFormData["status"]) || "draft",
      heroHeading: initialData?.heroHeading || "",
      heroSubheading: initialData?.heroSubheading || "",
      overview: initialData?.overview || "",
      artworkGuidance: initialData?.artworkGuidance || "",
      pricingNote: initialData?.pricingNote || "",
      minimumOrderNote: initialData?.minimumOrderNote || "",
      importantNotes: initialData?.importantNotes || "",
      detailCtaText: initialData?.detailCtaText || "",
      detailCtaUrl: initialData?.detailCtaUrl || "",
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
    },
  });


  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("title", value);
    if (isNew) setValue("slug", slugify(value));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "card" | "hero"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const asset = await adminUpload(file, "services");
    const img = { url: asset.publicUrl, alt: asset.alt };
    if (type === "card") setCardImage(img);
    else setHeroImage(img);
    toast.success("Image uploaded");
  };

  const onSubmit = async (data: ServiceFormData) => {
    if (!data.title) {
      toast.error("Title is required");
      return;
    }
    const payload = {
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription,
      cardImage,
      icon: data.icon,
      accentColor: data.accentColor,
      ctaText: data.ctaText,
      ctaUrl: data.ctaUrl,
      order: data.order,
      status: data.status,
      detail: {
        heroImage,
        heroHeading: data.heroHeading,
        heroSubheading: data.heroSubheading,
        overview: data.overview,
        suitableUses: suitableUses.split("\n").map((s) => s.trim()).filter(Boolean),
        productOptions: productOptions.split("\n").map((s) => s.trim()).filter(Boolean),
        customizationOptions: customizationOptions.split("\n").map((s) => s.trim()).filter(Boolean),
        artworkGuidance: data.artworkGuidance,
        pricingNote: data.pricingNote,
        minimumOrderNote: data.minimumOrderNote,
        importantNotes: data.importantNotes,
        ctaText: data.detailCtaText,
        ctaUrl: data.detailCtaUrl,
      },
      seo: { title: data.seoTitle, description: data.seoDescription },
    };

    if (isNew) {
      const created = await adminFetch<{ _id: string }>("/api/admin/services", {
        method: "POST",
        body: JSON.stringify(payload),
        successMessage: "Service created",
      });
      router.push(`/admin/services/${created._id}`);
    } else {
      await adminFetch(`/api/admin/services/${serviceId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        successMessage: "Service saved",
      });
      router.refresh();
    }
  };

  const tabs = [
    { id: "card" as const, label: "Card / Description" },
    { id: "detail" as const, label: "Detail Page" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex gap-1 rounded-lg border border-chrome-light/20 bg-white p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-royal-blue text-pure-paper shadow"
                : "text-carbon hover:bg-carbon/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "card" && (
        <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Card & Listing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Title">
              <input className={inputClass} {...register("title")} onChange={onTitleChange} />
            </FormField>
            <FormField label="Slug">
              <input className={inputClass} {...register("slug")} />
            </FormField>
            <FormField label="Status">
              <select className={selectClass} {...register("status")}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </FormField>
            <FormField label="Display Order">
              <input type="number" className={inputClass} {...register("order")} />
            </FormField>
            <FormField label="Short Description" className="sm:col-span-2">
              <textarea className={textareaClass} rows={3} {...register("shortDescription")} />
            </FormField>
            <FormField label="Icon (emoji or class)">
              <input className={inputClass} {...register("icon")} placeholder="🎨" />
            </FormField>
            <FormField label="Accent Color">
              <input type="color" className="h-10 w-full" {...register("accentColor")} />
            </FormField>
            <FormField label="CTA Text">
              <input className={inputClass} {...register("ctaText")} />
            </FormField>
            <FormField label="CTA URL">
              <input className={inputClass} {...register("ctaUrl")} />
            </FormField>
          </div>
          <FormField label="Card Image">
            {cardImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cardImage.url} alt="" className="mb-2 h-32 rounded-md object-cover" />
            )}
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "card")} />
          </FormField>
        </div>
      )}

      {activeTab === "detail" && (
        <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Detail Page Content</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Hero Heading">
              <input className={inputClass} {...register("heroHeading")} />
            </FormField>
            <FormField label="Hero Subheading">
              <input className={inputClass} {...register("heroSubheading")} />
            </FormField>
            <FormField label="Overview" className="sm:col-span-2">
              <textarea className={textareaClass} rows={4} {...register("overview")} />
            </FormField>
            <FormField label="Suitable Uses (one per line)" className="sm:col-span-2">
              <textarea className={textareaClass} rows={3} value={suitableUses} onChange={(e) => setSuitableUses(e.target.value)} />
            </FormField>
            <FormField label="Product Options (one per line)">
              <textarea className={textareaClass} rows={3} value={productOptions} onChange={(e) => setProductOptions(e.target.value)} />
            </FormField>
            <FormField label="Customization Options (one per line)">
              <textarea className={textareaClass} rows={3} value={customizationOptions} onChange={(e) => setCustomizationOptions(e.target.value)} />
            </FormField>
            <FormField label="Artwork Guidance" className="sm:col-span-2">
              <textarea className={textareaClass} rows={3} {...register("artworkGuidance")} />
            </FormField>
            <FormField label="Pricing Note">
              <textarea className={textareaClass} rows={2} {...register("pricingNote")} />
            </FormField>
            <FormField label="Minimum Order Note">
              <textarea className={textareaClass} rows={2} {...register("minimumOrderNote")} />
            </FormField>
            <FormField label="Important Notes" className="sm:col-span-2">
              <textarea className={textareaClass} rows={2} {...register("importantNotes")} />
            </FormField>
            <FormField label="Detail CTA Text">
              <input className={inputClass} {...register("detailCtaText")} />
            </FormField>
            <FormField label="Detail CTA URL">
              <input className={inputClass} {...register("detailCtaUrl")} />
            </FormField>
            <FormField label="SEO Title">
              <input className={inputClass} {...register("seoTitle")} />
            </FormField>
            <FormField label="SEO Description">
              <input className={inputClass} {...register("seoDescription")} />
            </FormField>
          </div>
          <FormField label="Hero Image">
            {heroImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImage.url} alt="" className="mb-2 h-40 rounded-md object-cover" />
            )}
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "hero")} />
          </FormField>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/services")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isNew ? "Create Service" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
