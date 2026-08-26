import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { getPrivateArtworkBuffer } from "@/lib/media";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const artwork = await getPrivateArtworkBuffer(id);

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    const safeName = artwork.originalName.replace(/[^\w.\- ]/g, "_");

    return new NextResponse(new Uint8Array(artwork.buffer), {
      status: 200,
      headers: {
        "Content-Type": artwork.mimeType,
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Content-Length": String(artwork.buffer.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Admin artwork GET error:", error);
    return NextResponse.json({ error: "Failed to download artwork" }, { status: 500 });
  }
}
