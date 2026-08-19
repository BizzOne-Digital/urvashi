import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getPublicMediaPath } from "@/lib/media";

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;

    if (!segments?.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const mediaPath = segments.join("/");

    if (
      mediaPath.includes("..") ||
      mediaPath.includes("\\") ||
      mediaPath.startsWith("/")
    ) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const filePath = await getPublicMediaPath(mediaPath);
    if (!filePath) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json({ error: "Failed to serve media" }, { status: 500 });
  }
}
