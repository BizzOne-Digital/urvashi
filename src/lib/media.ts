import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { connectDB } from "./db";
import MediaAsset from "@/models/MediaAsset";
import CustomerArtwork from "@/models/CustomerArtwork";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const PUBLIC_MAX_BYTES = 12 * 1024 * 1024;
const PRIVATE_MAX_BYTES = 25 * 1024 * 1024;

const PUBLIC_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const PRIVATE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

const SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "image/avif": [[0x00, 0x00, 0x00]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
};

function getUploadRoot(): string {
  return path.resolve(process.cwd(), UPLOAD_DIR);
}

function validateSignature(buffer: Buffer, mimeType: string): boolean {
  const sigs = SIGNATURES[mimeType];
  if (!sigs) return false;
  return sigs.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

function getDatePath(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  return `${y}/${m}`;
}

export function resolveSafePath(relativePath: string): string | null {
  const root = getUploadRoot();
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

export async function ensureUploadDirs(): Promise<void> {
  const root = getUploadRoot();
  await fs.mkdir(path.join(root, "public"), { recursive: true });
  await fs.mkdir(path.join(root, "private", "customer-artwork"), { recursive: true });
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
  if (!PUBLIC_MIME_TYPES.has(mimeType)) {
    throw new Error("Invalid file type for public media");
  }
  if (buffer.length > PUBLIC_MAX_BYTES) {
    throw new Error("File exceeds maximum size of 12MB");
  }
  if (!validateSignature(buffer, mimeType)) {
    throw new Error("File signature does not match declared type");
  }

  await ensureUploadDirs();
  const datePath = getDatePath();
  const filename = `${uuidv4()}.webp`;
  const relativePath = `public/${datePath}/${filename}`;
  const fullPath = path.join(getUploadRoot(), relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  let width: number | undefined;
  let height: number | undefined;

  try {
    const processed = await sharp(buffer)
      .rotate()
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });
    await fs.writeFile(fullPath, processed.data);
    width = processed.info.width;
    height = processed.info.height;
  } catch {
    const ext = mimeType === "image/png" ? "png" : "jpg";
    const altFilename = `${uuidv4()}.${ext}`;
    const altRelative = `public/${datePath}/${altFilename}`;
    const altFull = path.join(getUploadRoot(), altRelative);
    await fs.writeFile(altFull, buffer);
    const relativePath2 = altRelative;
    const publicUrl = `/media/${datePath}/${altFilename}`;

    await connectDB();
    const asset = await MediaAsset.create({
      originalName,
      diskPath: relativePath2,
      publicUrl,
      mimeType,
      bytes: buffer.length,
      alt: meta.alt,
      caption: meta.caption,
      category: meta.category,
      isPrivate: false,
      uploadedBy: meta.uploadedBy,
    });
    return asset;
  }

  const publicUrl = `/media/${datePath}/${filename}`;

  await connectDB();
  const asset = await MediaAsset.create({
    originalName,
    diskPath: relativePath,
    publicUrl,
    mimeType: "image/webp",
    bytes: buffer.length,
    width,
    height,
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
  if (!PRIVATE_MIME_TYPES.has(mimeType)) {
    throw new Error("Invalid file type for artwork upload");
  }
  if (buffer.length > PRIVATE_MAX_BYTES) {
    throw new Error("File exceeds maximum size of 25MB");
  }
  if (!validateSignature(buffer, mimeType)) {
    throw new Error("File signature does not match declared type");
  }
  if (!meta.rightsConfirmed) {
    throw new Error("Rights confirmation required");
  }

  await ensureUploadDirs();
  const datePath = getDatePath();
  const ext = mimeType === "application/pdf" ? "pdf" : mimeType === "image/png" ? "png" : "jpg";
  const filename = `${uuidv4()}.${ext}`;
  const relativePath = `private/customer-artwork/${datePath}/${filename}`;
  const fullPath = path.join(getUploadRoot(), relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);

  await connectDB();
  const artwork = await CustomerArtwork.create({
    originalName,
    diskPath: relativePath,
    mimeType,
    bytes: buffer.length,
    customerNote: meta.customerNote,
    rightsConfirmed: meta.rightsConfirmed,
    cartSessionId: meta.cartSessionId,
    uploadedBy: meta.uploadedBy,
  });

  return { id: artwork._id.toString(), originalName };
}

export async function getPrivateArtworkPath(artworkId: string): Promise<{
  path: string;
  mimeType: string;
  originalName: string;
} | null> {
  await connectDB();
  const artwork = await CustomerArtwork.findById(artworkId);
  if (!artwork) return null;

  const fullPath = resolveSafePath(artwork.diskPath);
  if (!fullPath || !existsSync(fullPath)) return null;

  return {
    path: fullPath,
    mimeType: artwork.mimeType,
    originalName: artwork.originalName,
  };
}

export async function getPublicMediaPath(mediaPath: string): Promise<string | null> {
  const safePath = resolveSafePath(`public/${mediaPath}`);
  if (!safePath || !existsSync(safePath)) return null;
  return safePath;
}

export function isUploadDirWritable(): boolean {
  try {
    const root = getUploadRoot();
    return existsSync(root) || true;
  } catch {
    return false;
  }
}
