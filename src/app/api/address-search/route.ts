import { NextRequest, NextResponse } from "next/server";
import {
  parseNominatimResult,
  parsePhotonFeature,
  type AddressSuggestion,
  type NominatimResult,
  type PhotonFeature,
} from "@/lib/address-autocomplete";

export const runtime = "nodejs";

const MIN_QUERY_LENGTH = 2;

async function searchPhoton(query: string): Promise<AddressSuggestion[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "8");
  url.searchParams.set("lang", "en");
  // Rough bounding box for Canada
  url.searchParams.set("bbox", "-141.0,41.7,-52.6,83.1");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { features?: PhotonFeature[] };
  const canadian = (data.features || []).filter(
    (feature) => feature.properties.countrycode?.toUpperCase() === "CA"
  );

  return canadian.map(parsePhotonFeature).filter((item) => item.label.length > 0);
}

async function searchNominatim(query: string): Promise<AddressSuggestion[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", query);
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "ca");
  url.searchParams.set("limit", "8");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "DPM-Custom-Prints/1.0 (checkout address search)",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = (await res.json()) as NominatimResult[];
  return data.map(parseNominatimResult);
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json([]);
  }

  try {
    const photonResults = await searchPhoton(q);
    if (photonResults.length > 0) {
      return NextResponse.json(photonResults.slice(0, 8));
    }

    const nominatimResults = await searchNominatim(q);
    return NextResponse.json(nominatimResults.slice(0, 8));
  } catch (error) {
    console.error("Address search error:", error);
    return NextResponse.json([]);
  }
}
