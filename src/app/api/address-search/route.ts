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
  url.searchParams.set("bbox", "-141.0,41.7,-52.6,83.1");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
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
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];

  const data = (await res.json()) as NominatimResult[];
  return data.map(parseNominatimResult);
}

function mergeSuggestions(...groups: AddressSuggestion[][]): AddressSuggestion[] {
  const seen = new Set<string>();
  const merged: AddressSuggestion[] = [];

  for (const group of groups) {
    for (const item of group) {
      const key = item.label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }

  return merged;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const city = request.nextUrl.searchParams.get("city")?.trim();

  if (!q || q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json([]);
  }

  const searchQuery = city && !q.toLowerCase().includes(city.toLowerCase())
    ? `${q}, ${city}, Canada`
    : `${q}, Canada`;

  try {
    const [photonResults, nominatimResults] = await Promise.all([
      searchPhoton(searchQuery),
      searchNominatim(searchQuery),
    ]);

    const merged = mergeSuggestions(photonResults, nominatimResults);
    return NextResponse.json(merged.slice(0, 8));
  } catch (error) {
    console.error("Address search error:", error);
    return NextResponse.json([]);
  }
}
