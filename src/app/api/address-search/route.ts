import { NextRequest, NextResponse } from "next/server";
import { parseNominatimResult, type NominatimResult } from "@/lib/address-autocomplete";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("q", q);
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("countrycodes", "ca");
    url.searchParams.set("limit", "6");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "DPM-Custom-Prints/1.0 (checkout address search)",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = (await res.json()) as NominatimResult[];
    return NextResponse.json(data.map(parseNominatimResult));
  } catch (error) {
    console.error("Address search error:", error);
    return NextResponse.json([]);
  }
}
