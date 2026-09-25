"use client";

import { toast } from "sonner";
import { resolveUploadFolder } from "@/lib/upload-folders";

export async function adminFetch<T = unknown>(
  url: string,
  options?: RequestInit & { successMessage?: string }
): Promise<T> {
  const { successMessage, ...fetchOptions } = options || {};
  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data as { error?: string }).error || "Request failed";
    toast.error(message);
    throw new Error(message);
  }

  if (successMessage) {
    toast.success(successMessage);
  }

  return data as T;
}

export async function adminUpload(file: File, category?: string) {
  const folder = category ? resolveUploadFolder(category) ?? "misc" : "misc";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    toast.error(data.error || "Upload failed");
    throw new Error(data.error || "Upload failed");
  }

  return {
    id: data.filename,
    publicUrl: data.url,
    alt: file.name,
    caption: undefined,
  };
}
