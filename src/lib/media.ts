import { connectDB } from "./db";
import MediaAsset from "@/models/MediaAsset";
import CustomerArtwork from "@/models/CustomerArtwork";
import {
  ARTWORK_MAX_BYTES,
  ARTWORK_MIME_TYPES,
  ADMIN_MAX_BYTES,
  ADMIN_UPLOAD_MIME_TYPES,
  buildUploadUrl,
  deleteStoredUploadByUrl,
  getStoredUpload,
  getStoredUploadById,
  parseUploadUrl,
  resolveUploadFolder,
  saveStoredUpload,
  type UploadFolder,
} from "./stored-uploads";

const SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "image/gif": [[0x47, 0x49, 0x46]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
};

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

export function normalizeArtworkMimeType(mimeType?: string): string {
  const value = (mimeType || "").trim().toLowerCase();
  if (value === "image/jpg") return "image/jpeg";
  return value;
}

function isWebpBuffer(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  );
}

/** Sniff supported artwork MIME from file bytes (ignores browser-declared type). */
export function detectArtworkMimeFromBuffer(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "image/png";
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return "image/gif";
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "application/pdf";
  }
  if (isWebpBuffer(buffer)) return "image/webp";
  return null;
}

function mimeTypeFromFilename(filename: string): string | null {
  const match = filename.trim().toLowerCase().match(/\.([a-z0-9]+)$/);
  if (!match) return null;
  return EXT_TO_MIME[match[1]] ?? null;
}

function validateSignature(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/webp") return isWebpBuffer(buffer);
  const sigs = SIGNATURES[mimeType];
  if (!sigs) return false;
  return sigs.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

function resolveArtworkMimeType(
  buffer: Buffer,
  declaredMime: string,
  originalName: string
): string | null {
  const detected = detectArtworkMimeFromBuffer(buffer);
  if (detected) return detected;

  const declared = normalizeArtworkMimeType(declaredMime);
  if (declared && ARTWORK_MIME_TYPES.has(declared) && validateSignature(buffer, declared)) {
    return declared;
  }

  const fromExt = mimeTypeFromFilename(originalName);
  if (fromExt && ARTWORK_MIME_TYPES.has(fromExt) && validateSignature(buffer, fromExt)) {
    return fromExt;
  }

  return null;
}

function mapCategoryToFolder(category?: string): UploadFolder {
  const folder = category ? resolveUploadFolder(category) : null;
  return folder ?? "misc";
}

export async function uploadPublicMedia(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  meta: {
    alt?: string;
    caption?: string;
    category?: string;
    uploadedBy?: string;
  } = {}
) {
  if (!ADMIN_UPLOAD_MIME_TYPES.has(mimeType)) {
    throw new Error("Invalid file type for public media");
  }
  if (buffer.length > ADMIN_MAX_BYTES) {
    throw new Error("File exceeds maximum size of 8MB");
  }

  const folder = mapCategoryToFolder(meta.category);

  const stored = await saveStoredUpload({
    folder,
    buffer,
    mimeType,
    access: "public",
    originalName,
  });

  await connectDB();
  const asset = await MediaAsset.create({
    originalName,
    diskPath: `${folder}/${stored.filename}`,
    publicUrl: stored.url,
    mimeType,
    bytes: stored.size,
    alt: meta.alt,
    caption: meta.caption,
    category: meta.category,
    isPrivate: false,
    uploadedBy: meta.uploadedBy,
  });

  return asset;
}

export async function uploadPrivateArtwork(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  meta: {
    customerNote?: string;
    rightsConfirmed: boolean;
    cartSessionId?: string;
    uploadedBy?: string;
  }
) {
  if (buffer.length > ARTWORK_MAX_BYTES) {
    throw new Error("File exceeds maximum size of 25MB");
  }

  const resolvedMime = resolveArtworkMimeType(buffer, mimeType, originalName);
  if (!resolvedMime || !ARTWORK_MIME_TYPES.has(resolvedMime)) {
    const declared = normalizeArtworkMimeType(mimeType);
    if (declared && !ARTWORK_MIME_TYPES.has(declared)) {
      throw new Error("Invalid file type for artwork upload");
    }
    throw new Error(
      "Could not read this artwork file. Please upload PNG, JPEG, WebP, or PDF (not HEIC or other formats)."
    );
  }
  if (!meta.rightsConfirmed) {
    throw new Error("Rights confirmation required");
  }

  const stored = await saveStoredUpload({
    folder: "misc",
    buffer,
    mimeType: resolvedMime,
    access: "private",
    originalName,
  });

  await connectDB();
  const artwork = await CustomerArtwork.create({
    originalName,
    diskPath: `misc/${stored.filename}`,
    storedUploadId: stored.id,
    mimeType: resolvedMime,
    bytes: stored.size,
    customerNote: meta.customerNote,
    rightsConfirmed: meta.rightsConfirmed,
    cartSessionId: meta.cartSessionId,
    uploadedBy: meta.uploadedBy,
  });

  return { id: artwork._id.toString(), originalName };
}

export async function getPrivateArtworkBuffer(artworkId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
  originalName: string;
} | null> {
  await connectDB();
  const artwork = await CustomerArtwork.findById(artworkId);
  if (!artwork) return null;

  if (artwork.storedUploadId) {
    const stored = await getStoredUploadById(artwork.storedUploadId.toString());
    if (!stored?.data) return null;
    const buffer = Buffer.isBuffer(stored.data) ? stored.data : Buffer.from(stored.data);
    return {
      buffer,
      mimeType: stored.mimeType,
      originalName: artwork.originalName,
    };
  }

  const legacyUrl = artwork.diskPath.startsWith("/")
    ? artwork.diskPath
    : buildUploadUrl("misc", artwork.diskPath.replace(/^misc\//, ""));

  const parsed = parseUploadUrl(legacyUrl);
  if (parsed) {
    const stored = await getStoredUpload(parsed.folder, parsed.filename);
    if (!stored?.data) return null;
    const buffer = Buffer.isBuffer(stored.data) ? stored.data : Buffer.from(stored.data);
    return {
      buffer,
      mimeType: stored.mimeType,
      originalName: artwork.originalName,
    };
  }

  return null;
}

export async function deleteUploadByUrl(url: string): Promise<boolean> {
  if (!url.startsWith("/api/uploads/")) return false;
  return deleteStoredUploadByUrl(url);
}
