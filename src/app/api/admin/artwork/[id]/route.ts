import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { getPrivateArtworkPath } from "@/lib/media";

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
    const artwork = await getPrivateArtworkPath(id);

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    const buffer = await readFile(artwork.path);
    const safeName = artwork.originalName.replace(/[^\w.\- ]/g, "_");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": artwork.mimeType,
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Admin artwork GET error:", error);
    return NextResponse.json({ error: "Failed to download artwork" }, { status: 500 });
  }
}
