"use client";

import { useState } from "react";
import { toast } from "sonner";
import { resolveImageSrc } from "@/lib/image-url";
import { type UploadFolder } from "@/lib/upload-folders";

interface LocalImageFieldProps {
  label?: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  folder: UploadFolder;
  className?: string;
}

async function deleteUploadUrl(url: string) {
  await fetch("/api/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export function LocalImageField({ label, value, onChange, folder, className }: LocalImageFieldProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (value?.startsWith("/api/uploads/")) {
        await deleteUploadUrl(value);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async () => {
    if (value?.startsWith("/api/uploads/")) {
      try {
        await deleteUploadUrl(value);
      } catch {
        toast.error("Could not delete stored image");
        return;
      }
    }
    onChange(null);
    toast.success("Image removed");
  };

  const previewSrc = value ? resolveImageSrc(value) : null;

  return (
    <div className={className}>
      {label && <label className="mb-2 block text-sm font-medium">{label}</label>}

      {previewSrc ? (
        <div className="space-y-3">
          <div className="relative aspect-square max-w-[200px] overflow-hidden rounded-sm border border-chrome-light bg-pure-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt="" className="h-full w-full object-contain p-2" />
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-sm border border-chrome-light px-3 py-1.5 text-sm font-medium hover:bg-chrome-light/20">
              {uploading ? "Uploading…" : "Replace"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="rounded-sm border border-chrome-light px-3 py-1.5 text-sm font-medium hover:bg-red-50 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-chrome-mid/50 bg-pure-paper px-4 py-8 text-center hover:border-royal-blue">
          <span className="text-sm font-medium text-ink-black">
            {uploading ? "Uploading…" : "Choose image"}
          </span>
          <span className="mt-1 text-xs text-chrome-mid">PNG, JPEG, WebP, GIF — max 8MB</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
      )}
    </div>
  );
}
