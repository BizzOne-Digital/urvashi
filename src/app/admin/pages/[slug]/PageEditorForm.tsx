"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
import type { IPageSection } from "@/models/Page";

interface PageData {
  _id: string;
  slug: string;
  title: string;
  status: string;
  sections: IPageSection[];
  seo: { title?: string; description?: string; ogImage?: string; canonical?: string };
}

export function PageEditorForm({ slug, initialData }: { slug: string; initialData: PageData }) {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue } = useForm<PageData>({
    defaultValues: initialData,
  });

  const sections = watch("sections") || [];

  const onSubmit = async (data: PageData) => {
    await adminFetch(`/api/admin/pages/${slug}`, {
      method: "PUT",
      body: JSON.stringify({
        title: data.title,
        status: data.status,
        sections: data.sections,
        seo: data.seo,
      }),
      successMessage: "Page saved successfully",
    });
    router.refresh();
  };

  const updateSection = (index: number, field: string, value: unknown) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setValue("sections", updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Page Settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title">
            <input className={inputClass} {...register("title")} />
          </FormField>
          <FormField label="Status">
            <select className={selectClass} {...register("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </FormField>
          <FormField label="SEO Title">
            <input className={inputClass} {...register("seo.title")} />
          </FormField>
          <FormField label="SEO Description">
            <input className={inputClass} {...register("seo.description")} />
          </FormField>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Sections</h2>
        {sections.map((section, index) => (
          <div
            key={section.key || index}
            className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-chrome-mid">#{section.order}</span>
                <h3 className="font-semibold text-ink-black">{section.key}</h3>
                <span className="rounded bg-carbon/10 px-2 py-0.5 text-xs text-carbon">
                  {section.type}
                </span>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={(e) => updateSection(index, "enabled", e.target.checked)}
                />
                Enabled
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Eyebrow">
                <input
                  className={inputClass}
                  value={section.eyebrow || ""}
                  onChange={(e) => updateSection(index, "eyebrow", e.target.value)}
                />
              </FormField>
              <FormField label="Heading">
                <input
                  className={inputClass}
                  value={section.heading || ""}
                  onChange={(e) => updateSection(index, "heading", e.target.value)}
                />
              </FormField>
              <FormField label="Subheading" className="sm:col-span-2">
                <input
                  className={inputClass}
                  value={section.subheading || ""}
                  onChange={(e) => updateSection(index, "subheading", e.target.value)}
                />
              </FormField>
              <FormField label="Body" className="sm:col-span-2">
                <textarea
                  className={textareaClass}
                  rows={4}
                  value={section.body || ""}
                  onChange={(e) => updateSection(index, "body", e.target.value)}
                />
              </FormField>
              <FormField label="CTA Text">
                <input
                  className={inputClass}
                  value={section.ctaText || ""}
                  onChange={(e) => updateSection(index, "ctaText", e.target.value)}
                />
              </FormField>
              <FormField label="CTA URL">
                <input
                  className={inputClass}
                  value={section.ctaUrl || ""}
                  onChange={(e) => updateSection(index, "ctaUrl", e.target.value)}
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/pages")}>
          Back
        </Button>
        <Button type="submit">Save Page</Button>
      </div>
    </form>
  );
}
