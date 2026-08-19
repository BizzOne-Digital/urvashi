import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { uploadPublicMedia } from "@/lib/media";

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

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const alt = (formData.get("alt") as string) || undefined;
    const caption = (formData.get("caption") as string) || undefined;
    const category = (formData.get("category") as string) || undefined;

    const asset = await uploadPublicMedia(buffer, file.type, file.name, {
      alt,
      caption,
      category,
      uploadedBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      asset: {
        id: asset._id.toString(),
        publicUrl: asset.publicUrl,
        originalName: asset.originalName,
        mimeType: asset.mimeType,
        bytes: asset.bytes,
        width: asset.width,
        height: asset.height,
        alt: asset.alt,
        caption: asset.caption,
        category: asset.category,
      },
    });
  } catch (error) {
    console.error("Admin upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
