import { NextRequest, NextResponse } from "next/server";
import {
  isCanadaPostAddressCompleteEnabled,
  resolveCanadaPostAddress,
} from "@/lib/canada-post-address-complete";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")?.trim();
  const searchTerm = request.nextUrl.searchParams.get("q")?.trim() || "";
  const next = request.nextUrl.searchParams.get("next")?.trim();

  if (!id) {
    return NextResponse.json({ error: "Missing address id" }, { status: 400 });
  }

  if (!isCanadaPostAddressCompleteEnabled()) {
    return NextResponse.json({ error: "Address verification is not configured" }, { status: 503 });
  }

  try {
    const address = await resolveCanadaPostAddress(id, searchTerm, next);

    if (!address) {
      return NextResponse.json({ error: "Could not resolve this address" }, { status: 404 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error("Address resolve error:", error);
    return NextResponse.json({ error: "Address lookup failed" }, { status: 502 });
  }
}
