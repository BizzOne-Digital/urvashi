"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import type { HomeViralItem, HomeViralMediaItem } from "@/lib/home-viral";
import { FormField, inputClass, selectClass } from "@/components/admin/FormField";
import { Button } from "@/components/ui/Button";
import { resolveImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/utils";

interface HomeViralGalleryEditorProps {
  item: HomeViralItem;
  productName: string;
  onChange: (media: HomeViralMediaItem[]) => void;
}

export function HomeViralGalleryEditor({ item, productName, onChange }: HomeViralGalleryEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [youtubeInput, setYoutubeInput] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const appendMedia = (entries: HomeViralMediaItem[]) => {
    onChange([...item.media, ...entries]);
  };

  const updateAt = (index: number, patch: Partial<HomeViralMediaItem>) => {
    const next = item.media.map((m, i) => (i === index ? { ...m, ...patch } : m));
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(item.media.filter((_, i) => i !== index));
  };

  const moveAt = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= item.media.length) return;
    const media = [...item.media];
    [media[index], media[next]] = [media[next], media[index]];
    onChange(media);
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;

    setUploading(true);
    const added: HomeViralMediaItem[] = [];

    try {
      for (const file of list) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "gallery");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        const type = file.type.startsWith("video/") ? "video" : "image";
        added.push({
          type,
          url: data.url,
          alt: type === "image" ? `${productName} photo` : `${productName} video`,
        });
      }

      appendMedia(added);
      toast.success(
        added.length === 1
          ? added[0].type === "video"
            ? "Video added"
            : "Photo added"
          : `${added.length} files added`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addYoutube = () => {
    const url = youtubeInput.trim();
    if (!url) {
      toast.error("Paste a YouTube link first");
      return;
    }
    appendMedia([{ type: "video", url, alt: `${productName} video` }]);
    setYoutubeInput("");
    toast.success("YouTube video added");
  };

  return (
    <div className="mt-3 space-y-4 rounded-lg border border-dashed border-chrome-light/40 bg-white p-4">
      <p className="text-sm text-chrome-mid">
        Add <strong>photos and videos</strong> for <strong>{productName}</strong>. Visitors see these
        when they tap this product on the homepage, then customize on the last slide.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          className="!py-2 !text-sm"
          disabled={uploading}
          onClick={() => photoInputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload photos"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="!py-2 !text-sm"
          disabled={uploading}
          onClick={() => videoInputRef.current?.click()}
        >
          Upload video file
        </Button>
        <input
          ref={photoInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          className="hidden"
          accept="video/mp4,video/webm,video/quicktime"
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files?.[0]) uploadFiles([e.target.files[0]]);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <FormField label="Or paste YouTube link" className="min-w-[min(100%,280px)] flex-1">
          <input
            className={inputClass}
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </FormField>
        <Button type="button" variant="secondary" className="!py-2 !text-sm" onClick={addYoutube}>
          Add YouTube video
        </Button>
      </div>

      {item.media.length === 0 ? (
        <p className="rounded-lg bg-carbon/5 px-3 py-4 text-center text-sm text-chrome-mid">
          No photos or videos yet. Use the buttons above, or leave empty to show default product images.
        </p>
      ) : (
        <ul className="space-y-3">
          {item.media.map((media, index) => (
            <li
              key={`${media.url}-${index}`}
              className="flex flex-col gap-3 rounded-lg border border-chrome-light/30 p-3 sm:flex-row"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-md bg-carbon/10 sm:h-20 sm:w-28">
                {media.type === "image" && media.url ? (
                  <Image
                    src={resolveImageSrc(media.url)}
                    alt={media.alt || ""}
                    fill
                    className="object-cover"
                    unoptimized={media.url.startsWith("/api/uploads/")}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-semibold uppercase text-chrome-mid">
                    Video
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-carbon">
                    {index + 1}. {media.type === "video" ? "Video" : "Photo"}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="rounded border px-2 py-0.5 text-xs"
                      disabled={index === 0}
                      onClick={() => moveAt(index, -1)}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="rounded border px-2 py-0.5 text-xs"
                      disabled={index === item.media.length - 1}
                      onClick={() => moveAt(index, 1)}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="rounded border px-2 py-0.5 text-xs text-red-700"
                      onClick={() => removeAt(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <FormField label="Type">
                  <select
                    className={selectClass}
                    value={media.type}
                    onChange={(e) =>
                      updateAt(index, { type: e.target.value === "video" ? "video" : "image" })
                    }
                  >
                    <option value="image">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </FormField>

                <FormField label="File URL (from upload or YouTube)">
                  <input
                    className={inputClass}
                    value={media.url}
                    onChange={(e) => updateAt(index, { url: e.target.value })}
                    placeholder="/api/uploads/gallery/... or YouTube URL"
                  />
                </FormField>

                <FormField label="Caption (optional)">
                  <input
                    className={inputClass}
                    value={media.alt || ""}
                    onChange={(e) => updateAt(index, { alt: e.target.value })}
                  />
                </FormField>

                <label
                  className={cn(
                    "inline-flex cursor-pointer text-xs font-medium text-royal-blue",
                    uploading && "opacity-50"
                  )}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept={
                      media.type === "video"
                        ? "video/mp4,video/webm,video/quicktime"
                        : "image/jpeg,image/png,image/webp,image/gif"
                    }
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        formData.append("folder", "gallery");
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Upload failed");
                        const type = file.type.startsWith("video/") ? "video" : "image";
                        updateAt(index, { url: data.url, type });
                        toast.success("Replaced file");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Upload failed");
                      } finally {
                        setUploading(false);
                        e.target.value = "";
                      }
                    }}
                  />
                  Replace with new upload
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
