"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch, adminUpload } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";

interface GalleryCategoryData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  order: number;
  status: string;
}

interface MediaAssetData {
  _id: string;
  publicUrl?: string;
  originalName: string;
  alt?: string;
  caption?: string;
  order: number;
  isPublished: boolean;
  isFeatured: boolean;
}

interface GalleryEditorProps {
  categoryId: string;
  initialCategory: GalleryCategoryData;
  initialAssets: MediaAssetData[];
}

export function GalleryEditor({ categoryId, initialCategory, initialAssets }: GalleryEditorProps) {
  const router = useRouter();
  const isNew = categoryId === "new";
  const [category, setCategory] = useState(initialCategory);
  const [assets, setAssets] = useState(initialAssets);
  const [saving, setSaving] = useState(false);

  const handleSaveCategory = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const created = await adminFetch<GalleryCategoryData>("/api/admin/gallery", {
          method: "POST",
          body: JSON.stringify(category),
          successMessage: "Category created",
        });
        router.push(`/admin/gallery/${created._id}`);
      } else {
        await adminFetch(`/api/admin/gallery/${categoryId}`, {
          method: "PUT",
          body: JSON.stringify({ category, assets }),
          successMessage: "Gallery saved",
        });
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isNew) return;
    const uploaded = await adminUpload(file, "gallery");
    await adminFetch(`/api/admin/gallery/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify({
        newAsset: {
          originalName: file.name,
          diskPath: uploaded.publicUrl,
          publicUrl: uploaded.publicUrl,
          mimeType: file.type,
          bytes: file.size,
          alt: uploaded.alt,
          order: assets.length,
          isPublished: true,
          isFeatured: false,
        },
      }),
      successMessage: "Image added",
    });
    const data = await adminFetch<{ assets: MediaAssetData[] }>(`/api/admin/gallery/${categoryId}`);
    setAssets(data.assets);
  };

  const handleDeleteCategory = async () => {
    if (isNew) return;
    if (!confirm("Delete this category and all its images?")) return;
    await adminFetch(`/api/admin/gallery/${categoryId}`, {
      method: "DELETE",
      successMessage: "Category deleted",
    });
    router.push("/admin/gallery");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Category Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name">
            <input
              className={inputClass}
              value={category.name}
              onChange={(e) =>
                setCategory({
                  ...category,
                  name: e.target.value,
                  slug: isNew ? slugify(e.target.value) : category.slug,
                })
              }
            />
          </FormField>
          <FormField label="Slug">
            <input
              className={inputClass}
              value={category.slug}
              onChange={(e) => setCategory({ ...category, slug: e.target.value })}
            />
          </FormField>
          <FormField label="Status">
            <select
              className={selectClass}
              value={category.status}
              onChange={(e) => setCategory({ ...category, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>
          <FormField label="Order">
            <input
              type="number"
              className={inputClass}
              value={category.order}
              onChange={(e) => setCategory({ ...category, order: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Description" className="sm:col-span-2">
            <textarea
              className={textareaClass}
              rows={3}
              value={category.description || ""}
              onChange={(e) => setCategory({ ...category, description: e.target.value })}
            />
          </FormField>
        </div>
      </div>

      {!isNew && (
        <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Images ({assets.length})</h2>
            <input type="file" accept="image/*" onChange={handleUpload} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {assets.map((asset) => (
              <div key={asset._id} className="overflow-hidden rounded-md border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.publicUrl || ""}
                  alt={asset.alt || asset.originalName}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-2 text-xs text-chrome-mid">{asset.originalName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        {!isNew && (
          <Button type="button" variant="ghost" onClick={handleDeleteCategory} className="text-deep-magenta">
            Delete Category
          </Button>
        )}
        <div className="ml-auto flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/gallery")}>
            Back
          </Button>
          <Button onClick={handleSaveCategory} disabled={saving}>
            {saving ? "Saving…" : isNew ? "Create Category" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
