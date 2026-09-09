"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { MAX_ARTWORK_FILES } from "@/lib/artwork-upload";

export { MAX_ARTWORK_FILES };

export interface LocalArtworkFile {
  key: string;
  file: File;
  previewUrl: string;
  artworkId: string | null;
  uploading: boolean;
  error?: string;
}

interface ArtworkMultiUploadProps {
  items: LocalArtworkFile[];
  onChange: (items: LocalArtworkFile[]) => void;
  rightsConfirmed: boolean;
  customerNote?: string;
  className?: string;
  label?: string;
  hint?: string;
  hidePreviews?: boolean;
}

function makeKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function ArtworkMultiUpload({
  items,
  onChange,
  rightsConfirmed,
  customerNote,
  className,
  label = "Upload your picture / artwork",
  hint = "PNG, JPEG, WebP, or PDF — max 25MB each. Add multiple images for collages.",
  hidePreviews = false,
}: ArtworkMultiUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const uploadOne = useCallback(
    async (item: LocalArtworkFile): Promise<LocalArtworkFile> => {
      if (!rightsConfirmed) return item;

      const body = new FormData();
      body.append("file", item.file);
      body.append("rightsConfirmed", "true");
      if (customerNote) body.append("customerNote", customerNote);

      try {
        const res = await fetch("/api/upload/artwork", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Upload failed");
        const id = json.artwork?.id || json.artwork?._id;
        if (!id) throw new Error("Upload did not return artwork id");
        return { ...item, uploading: false, artworkId: id, error: undefined };
      } catch (err) {
        return {
          ...item,
          uploading: false,
          error: err instanceof Error ? err.message : "Upload failed",
        };
      }
    },
    [rightsConfirmed, customerNote]
  );

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList);
      if (!incoming.length) return;

      const remaining = MAX_ARTWORK_FILES - items.length;
      if (remaining <= 0) return;

      const accepted = incoming.slice(0, remaining);
      const newItems: LocalArtworkFile[] = accepted.map((file) => ({
        key: makeKey(file),
        file,
        previewUrl: URL.createObjectURL(file),
        artworkId: null,
        uploading: rightsConfirmed,
      }));

      const merged = [...items, ...newItems];
      onChange(merged);

      if (!rightsConfirmed) return;

      const uploaded = await Promise.all(newItems.map((item) => uploadOne(item)));
      onChange(
        merged.map((existing) => uploaded.find((u) => u.key === existing.key) || existing)
      );
    },
    [items, onChange, rightsConfirmed, uploadOne]
  );

  const removeItem = (key: string) => {
    const target = items.find((item) => item.key === key);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(items.filter((item) => item.key !== key));
  };

  const retryUpload = async (key: string) => {
    const item = items.find((entry) => entry.key === key);
    if (!item || !rightsConfirmed) return;

    onChange(items.map((entry) => (entry.key === key ? { ...entry, uploading: true, error: undefined } : entry)));
    const uploaded = await uploadOne({ ...item, uploading: true });
    onChange(items.map((entry) => (entry.key === key ? uploaded : entry)));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="mb-2 block text-sm font-medium text-pure-paper">{label}</label>

      <div
        className={cn(
          "rounded-lg border border-dashed border-white/15 bg-[#0a0c14] p-4 transition-colors",
          dragOver && "border-cyan/40 bg-cyan/5"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          multiple
          disabled={items.length >= MAX_ARTWORK_FILES}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
          className="block w-full text-sm text-chrome-light file:mr-3 file:rounded-sm file:border-0 file:bg-cyan/20 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-cyan hover:file:bg-cyan/30"
        />
        <p className="mt-2 text-xs text-chrome-mid">
          {hint} ({items.length}/{MAX_ARTWORK_FILES} files)
        </p>
        {!rightsConfirmed && items.length > 0 && (
          <p className="mt-2 text-xs text-yellow-300/90">
            Confirm artwork rights below to upload your files to our team.
          </p>
        )}
      </div>

      {items.length > 0 && !hidePreviews && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.key}
              className="relative overflow-hidden rounded-lg border border-white/10 bg-[#0a0c14]"
            >
              {item.file.type.startsWith("image/") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="aspect-square w-full object-contain p-2"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center p-3 text-center text-xs text-chrome-light">
                  {item.file.name}
                </div>
              )}
              <div className="border-t border-white/10 px-2 py-1.5">
                <p className="truncate text-[10px] text-chrome-mid">{item.file.name}</p>
                {item.uploading && <p className="text-[10px] text-cyan">Uploading…</p>}
                {item.artworkId && <p className="text-[10px] text-green-400">Ready</p>}
                {item.error && (
                  <button
                    type="button"
                    onClick={() => retryUpload(item.key)}
                    className="text-[10px] text-deep-magenta underline"
                  >
                    Retry upload
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-pure-paper hover:bg-black"
                aria-label={`Remove ${item.file.name}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function getArtworkImagePreviewUrls(items: LocalArtworkFile[]): string[] {
  return items
    .filter((item) => item.file.type.startsWith("image/"))
    .map((item) => item.previewUrl);
}

export function getUploadedArtworkIds(items: LocalArtworkFile[]): string[] {
  return items.map((item) => item.artworkId).filter((id): id is string => Boolean(id));
}

export function clearArtworkItems(items: LocalArtworkFile[]) {
  items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
}

export async function uploadArtworkItemsOnSubmit(
  items: LocalArtworkFile[],
  rightsConfirmed: boolean,
  customerNote?: string
): Promise<{ items: LocalArtworkFile[]; artworkIds: string[] }> {
  if (!rightsConfirmed) {
    throw new Error("Please confirm artwork rights");
  }

  const next = [...items];
  for (let i = 0; i < next.length; i += 1) {
    const item = next[i];
    if (item.artworkId) continue;

    const body = new FormData();
    body.append("file", item.file);
    body.append("rightsConfirmed", "true");
    if (customerNote) body.append("customerNote", customerNote);

    const res = await fetch("/api/upload/artwork", { method: "POST", body });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `Failed to upload ${item.file.name}`);

    const id = json.artwork?.id || json.artwork?._id;
    if (!id) throw new Error(`Upload did not return id for ${item.file.name}`);

    next[i] = { ...item, artworkId: id, uploading: false, error: undefined };
  }

  const artworkIds = getUploadedArtworkIds(next);
  if (!artworkIds.length) throw new Error("Please upload at least one image");

  return { items: next, artworkIds };
}

/** Upload local files after the rights checkbox is confirmed. */
export async function uploadPendingArtworkItems(
  items: LocalArtworkFile[],
  customerNote?: string
): Promise<LocalArtworkFile[]> {
  const next = [...items];
  for (let i = 0; i < next.length; i += 1) {
    const item = next[i];
    if (item.artworkId || item.uploading) continue;

    next[i] = { ...item, uploading: true, error: undefined };

    const body = new FormData();
    body.append("file", item.file);
    body.append("rightsConfirmed", "true");
    if (customerNote) body.append("customerNote", customerNote);

    try {
      const res = await fetch("/api/upload/artwork", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      const id = json.artwork?.id || json.artwork?._id;
      if (!id) throw new Error("Upload did not return artwork id");
      next[i] = { ...item, uploading: false, artworkId: id, error: undefined };
    } catch (err) {
      next[i] = {
        ...item,
        uploading: false,
        error: err instanceof Error ? err.message : "Upload failed",
      };
    }
  }

  return next;
}
