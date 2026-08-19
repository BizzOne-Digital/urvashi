import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { uploadPrivateArtwork } from "@/lib/media";

const artworkMetaSchema = z.object({
  customerNote: z.string().max(1000).optional(),
  rightsConfirmed: z
    .string()
    .transform((v) => v === "true" || v === "1")
    .pipe(z.literal(true, { errorMap: () => ({ message: "Rights confirmation required" }) })),
  cartSessionId: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`artwork-upload:${ip}`, 10, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many uploads. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const metaParsed = artworkMetaSchema.safeParse({
      customerNote: formData.get("customerNote") ?? undefined,
      rightsConfirmed: formData.get("rightsConfirmed") ?? "false",
      cartSessionId: formData.get("cartSessionId") ?? undefined,
    });

    if (!metaParsed.success) {
      return NextResponse.json(
        { error: "Invalid metadata", details: metaParsed.error.flatten() },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadPrivateArtwork(buffer, file.type, file.name, {
      customerNote: metaParsed.data.customerNote,
      rightsConfirmed: metaParsed.data.rightsConfirmed,
      cartSessionId: metaParsed.data.cartSessionId,
    });

    return NextResponse.json({
      success: true,
      artwork: result,
    });
  } catch (error) {
    console.error("Artwork upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
