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

function validateSignature(buffer: Buffer, mimeType: string): boolean {
  const sigs = SIGNATURES[mimeType];
  if (!sigs) return false;
  return sigs.some((sig) => sig.every((byte, i) => buffer[i] === byte));
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
  if (!ARTWORK_MIME_TYPES.has(mimeType)) {
    throw new Error("Invalid file type for artwork upload");
  }
  if (buffer.length > ARTWORK_MAX_BYTES) {
    throw new Error("File exceeds maximum size of 25MB");
  }
  if (!validateSignature(buffer, mimeType)) {
    throw new Error("File signature does not match declared type");
  }
  if (!meta.rightsConfirmed) {
    throw new Error("Rights confirmation required");
  }

  const stored = await saveStoredUpload({
    folder: "misc",
    buffer,
    mimeType,
    access: "private",
    originalName,
  });

  await connectDB();
  const artwork = await CustomerArtwork.create({
    originalName,
    diskPath: `misc/${stored.filename}`,
    storedUploadId: stored.id,
    mimeType,
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
