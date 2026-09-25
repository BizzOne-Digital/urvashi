"use client";

import { useRef } from "react";
import {
  type LocalArtworkFile,
  uploadPendingArtworkItems,
} from "@/components/customize/ArtworkMultiUpload";
import { CALENDAR_MONTH_COUNT, CALENDAR_MONTHS } from "@/lib/calendar-customize";
import { cn } from "@/lib/utils";

function makeKey(file: File, monthIndex: number) {
  return `month-${monthIndex}-${file.name}-${file.size}-${file.lastModified}`;
}

function createLocalArtwork(file: File, monthIndex: number): LocalArtworkFile {
  return {
    key: makeKey(file, monthIndex),
    file,
    previewUrl: URL.createObjectURL(file),
    artworkId: null,
    uploading: false,
  };
}

interface CalendarArtworkUploadProps {
  slots: (LocalArtworkFile | null)[];
  onChange: (slots: (LocalArtworkFile | null)[]) => void;
  rightsConfirmed: boolean;
  customerNote?: string;
  onMonthFocus?: (monthIndex: number) => void;
  className?: string;
}

export function CalendarArtworkUpload({
  slots,
  onChange,
  rightsConfirmed,
  customerNote,
  onMonthFocus,
  className,
}: CalendarArtworkUploadProps) {
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const filledCount = slots.filter(Boolean).length;

  const setSlot = (monthIndex: number, item: LocalArtworkFile | null) => {
    const next = [...slots];
    const existing = next[monthIndex];
    if (existing) URL.revokeObjectURL(existing.previewUrl);
    next[monthIndex] = item;
    onChange(next);
  };

  const uploadSlotIfReady = async (monthIndex: number, item: LocalArtworkFile) => {
    if (!rightsConfirmed) return;

    const [uploaded] = await uploadPendingArtworkItems([item], customerNote);
    const next = [...slots];
    next[monthIndex] = uploaded;
    onChange(next);
  };

  const handleMonthFile = async (monthIndex: number, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const item = createLocalArtwork(file, monthIndex);
    setSlot(monthIndex, item);
    onMonthFocus?.(monthIndex);

    if (rightsConfirmed) {
      const next = [...slots];
      next[monthIndex] = { ...item, uploading: true };
      onChange(next);
      await uploadSlotIfReady(monthIndex, item);
    }
  };

  const handleBulkFiles = async (files: FileList | File[]) => {
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!images.length) return;

    const next = [...slots];
    let imageIndex = 0;

    for (let monthIndex = 0; monthIndex < CALENDAR_MONTH_COUNT && imageIndex < images.length; monthIndex += 1) {
      if (next[monthIndex]) continue;
      const file = images[imageIndex];
      imageIndex += 1;
      next[monthIndex] = createLocalArtwork(file, monthIndex);
    }

    onChange(next);

    if (!rightsConfirmed) return;

    for (let monthIndex = 0; monthIndex < CALENDAR_MONTH_COUNT; monthIndex += 1) {
      const item = next[monthIndex];
      if (!item || item.artworkId) continue;
      await uploadSlotIfReady(monthIndex, item);
    }
  };

  const removeSlot = (monthIndex: number) => {
    setSlot(monthIndex, null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <label className="mb-2 block text-sm font-medium text-pure-paper">
          Upload 12 monthly photos
        </label>
        <p className="text-xs text-chrome-mid">
          Add one image per month (January–December). You can upload them one at a time or select up to 12
          images at once — they will fill empty months in order.
        </p>
        <p className="mt-1 text-xs text-cyan">{filledCount}/{CALENDAR_MONTH_COUNT} months added</p>
      </div>

      <div className="rounded-lg border border-dashed border-white/15 bg-[#0a0c14] p-4">
        <input
          ref={bulkInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleBulkFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => bulkInputRef.current?.click()}
          className="rounded-sm bg-cyan/20 px-3 py-2 text-xs font-semibold text-cyan hover:bg-cyan/30"
        >
          Choose multiple photos at once
        </button>
        {!rightsConfirmed && filledCount > 0 && (
          <p className="mt-2 text-xs text-yellow-300/90">
            Confirm artwork rights below to upload your photos to our team.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CALENDAR_MONTHS.map((month, monthIndex) => {
          const item = slots[monthIndex];

          return (
            <div
              key={month}
              className="overflow-hidden rounded-lg border border-white/10 bg-[#0a0c14]"
            >
              <div className="border-b border-white/10 px-2 py-1.5">
                <p className="text-xs font-semibold text-pure-paper">{month}</p>
              </div>

              <div className="relative aspect-square bg-[#12141c]">
                {item?.file.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl}
                    alt={`${month} photo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-chrome-mid">
                    No photo yet
                  </div>
                )}

                {item && (
                  <button
                    type="button"
                    onClick={() => removeSlot(monthIndex)}
                    className="absolute right-1 top-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-pure-paper"
                    aria-label={`Remove ${month} photo`}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="border-t border-white/10 p-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  id={`calendar-month-${monthIndex}`}
                  className="block w-full text-[10px] text-chrome-light file:mr-2 file:rounded-sm file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-[10px] file:text-pure-paper"
                  onChange={(e) => {
                    handleMonthFile(monthIndex, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                  onFocus={() => onMonthFocus?.(monthIndex)}
                />
                {item?.uploading && <p className="mt-1 text-[10px] text-cyan">Uploading…</p>}
                {item?.artworkId && <p className="mt-1 text-[10px] text-green-400">Ready</p>}
                {item?.error && <p className="mt-1 text-[10px] text-deep-magenta">{item.error}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function getCalendarArtworkItems(slots: (LocalArtworkFile | null)[]): LocalArtworkFile[] {
  return slots.filter((item): item is LocalArtworkFile => Boolean(item));
}

export function getCalendarPreviewUrls(slots: (LocalArtworkFile | null)[]): string[] {
  return slots.map((item) =>
    item && item.file.type.startsWith("image/") ? item.previewUrl : ""
  );
}

export function createEmptyCalendarSlots(): (LocalArtworkFile | null)[] {
  return Array.from({ length: CALENDAR_MONTH_COUNT }, () => null);
}
