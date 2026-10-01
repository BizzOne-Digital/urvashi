import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MediaAsset from "@/models/MediaAsset";
import { getStoredUpload, parseUploadUrl } from "@/lib/stored-uploads";

export const runtime = "nodejs";

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

    await connectDB();
    const asset = await MediaAsset.findOne({
      $or: [{ publicUrl: `/media/${mediaPath}` }, { diskPath: `public/${mediaPath}` }],
    }).lean();

    if (!asset?.publicUrl) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const parsed = parseUploadUrl(asset.publicUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const doc = await getStoredUpload(parsed.folder, parsed.filename);
    if (!doc?.data || doc.access === "private") {
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
    console.error("Media GET error:", error);
    return NextResponse.json({ error: "Failed to serve media" }, { status: 500 });
  }
}
