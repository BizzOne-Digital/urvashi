import crypto from "crypto";
import { connectDB } from "./db";
import StoredUpload, { type StoredUploadAccess } from "@/models/StoredUpload";
import {
  type UploadFolder,
  isUploadFolder,
  resolveUploadFolder,
} from "./upload-folders";

export type { UploadFolder } from "./upload-folders";
export { UPLOAD_FOLDERS, resolveUploadFolder, isUploadFolder } from "./upload-folders";

export const ADMIN_UPLOAD_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ARTWORK_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export const ADMIN_MAX_BYTES = 8 * 1024 * 1024;
export const ARTWORK_MAX_BYTES = 25 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export function sanitizeFilename(filename: string): boolean {
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return false;
  }
  return true;
}

export function parseUploadUrl(url: string): { folder: UploadFolder; filename: string } | null {
  const match = url.match(/^\/api\/uploads\/([^/]+)\/([^/]+)$/);
  if (!match) return null;

  const folder = resolveUploadFolder(match[1]);
  const filename = match[2];
  if (!folder || !sanitizeFilename(filename)) return null;

  return { folder, filename };
}

export function buildUploadUrl(folder: UploadFolder, filename: string): string {
  return `/api/uploads/${folder}/${filename}`;
}

export function extensionForMime(mimeType: string): string | null {
  return MIME_TO_EXT[mimeType] ?? null;
}

export function generateUploadFilename(ext: string): string {
  const random = crypto.randomBytes(8).toString("hex");
  return `${Date.now()}-${random}.${ext}`;
}

export async function saveStoredUpload(options: {
  folder: UploadFolder;
  buffer: Buffer;
  mimeType: string;
  access?: StoredUploadAccess;
  originalName?: string;
}): Promise<{ url: string; filename: string; size: number; folder: UploadFolder; id: string }> {
  const ext = extensionForMime(options.mimeType);
  if (!ext) {
    throw new Error("Unsupported file type");
  }

  const filename = generateUploadFilename(ext);
  await connectDB();

  const doc = await StoredUpload.create({
    folder: options.folder,
    filename,
    mimeType: options.mimeType,
    size: options.buffer.length,
    data: options.buffer,
    access: options.access ?? "public",
    originalName: options.originalName,
  });

  return {
    id: doc._id.toString(),
    folder: options.folder,
    filename,
    size: options.buffer.length,
    url: buildUploadUrl(options.folder, filename),
  };
}

export async function getStoredUpload(folder: string, filename: string) {
  if (!isUploadFolder(folder) || !sanitizeFilename(filename)) return null;

  await connectDB();
  return StoredUpload.findOne({ folder, filename }).lean();
}

export async function getStoredUploadById(id: string) {
  await connectDB();
  return StoredUpload.findById(id).lean();
}

export async function deleteStoredUpload(folder: string, filename: string): Promise<boolean> {
  if (!isUploadFolder(folder) || !sanitizeFilename(filename)) return false;

  await connectDB();
  const result = await StoredUpload.deleteOne({ folder, filename });
  return result.deletedCount > 0;
}

export async function deleteStoredUploadByUrl(url: string): Promise<boolean> {
  const parsed = parseUploadUrl(url);
  if (!parsed) return false;
  return deleteStoredUpload(parsed.folder, parsed.filename);
}
