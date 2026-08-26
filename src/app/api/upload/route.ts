import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import {
  ADMIN_MAX_BYTES,
  ADMIN_UPLOAD_MIME_TYPES,
  deleteStoredUploadByUrl,
  extensionForMime,
  parseUploadUrl,
  resolveUploadFolder,
  saveStoredUpload,
} from "@/lib/stored-uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = (formData.get("folder") as string) || "misc";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const folder = resolveUploadFolder(folderRaw);
    if (!folder) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    if (!ADMIN_UPLOAD_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > ADMIN_MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds maximum size of 8MB" }, { status: 400 });
    }

    if (!extensionForMime(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const stored = await saveStoredUpload({
      folder,
      buffer,
      mimeType: file.type,
      access: "public",
      originalName: file.name,
    });

    void session;

    return NextResponse.json({
      success: true,
      url: stored.url,
      filename: stored.filename,
      size: stored.size,
      folder: stored.folder,
    });
  } catch (error) {
    console.error("Upload POST error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url : "";

    if (!url.startsWith("/api/uploads/")) {
      return NextResponse.json({ error: "Invalid upload URL" }, { status: 400 });
    }

    const parsed = parseUploadUrl(url);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid upload URL" }, { status: 400 });
    }

    const deleted = await deleteStoredUploadByUrl(url);
    if (!deleted) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload DELETE error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
