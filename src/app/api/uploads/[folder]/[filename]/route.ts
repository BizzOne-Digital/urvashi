import { NextRequest, NextResponse } from "next/server";
import { getStoredUpload, isUploadFolder, sanitizeFilename } from "@/lib/stored-uploads";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ folder: string; filename: string }> }
) {
  try {
    const { folder, filename } = await params;

    if (!isUploadFolder(folder) || !sanitizeFilename(filename)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const doc = await getStoredUpload(folder, filename);
    if (!doc || doc.access === "private") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = Buffer.isBuffer(doc.data) ? doc.data : Buffer.from(doc.data);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Stored upload GET error:", error);
    return NextResponse.json({ error: "Failed to serve upload" }, { status: 500 });
  }
}
