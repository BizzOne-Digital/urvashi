import type { AddressSelection } from "@/lib/address-autocomplete";
import { formatCanadianPostalCode } from "@/lib/canadian-postal";
import { normalizeProvinceCode } from "@/lib/canadian-tax";

const FIND_URL =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Find/v2.10/json3.ws";
const RETRIEVE_URL =
  "https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Retrieve/v2.11/json.ws";

export interface AddressCompleteFindItem {
  id: string;
  label: string;
  description: string;
  next: "Find" | "Retrieve" | string;
}

function getAddressCompleteKey(): string | undefined {
  return process.env.CANADA_POST_ADDRESS_COMPLETE_KEY?.trim();
}

export function isCanadaPostAddressCompleteEnabled(): boolean {
  return Boolean(getAddressCompleteKey());
}

async function fetchJson(url: URL): Promise<Record<string, unknown>> {
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(`AddressComplete request failed (${res.status})`);
  }
  return (await res.json()) as Record<string, unknown>;
}

function parseFindItems(data: Record<string, unknown>): AddressCompleteFindItem[] {
  const items = (data.Items as Array<Record<string, string>>) || [];
  return items
    .map((item) => ({
      id: item.Id || "",
      label: item.Text || "",
      description: item.Description || "",
      next: item.Next || "Find",
    }))
    .filter((item) => item.id && item.label);
}

export async function findCanadaPostAddresses(
  searchTerm: string,
  lastId?: string
): Promise<AddressCompleteFindItem[]> {
  const key = getAddressCompleteKey();
  if (!key) return [];

  const url = new URL(FIND_URL);
  url.searchParams.set("Key", key);
  url.searchParams.set("SearchTerm", searchTerm);
  url.searchParams.set("Country", "CAN");
  if (lastId) url.searchParams.set("LastId", lastId);

  const data = await fetchJson(url);
  return parseFindItems(data);
}

function parseRetrieveRow(row: Record<string, string>): AddressSelection {
  const line1 = row.Line1 || [row.BuildingNumber, row.Street].filter(Boolean).join(" ");
  const postalCode = formatCanadianPostalCode(row.PostalCode) || row.PostalCode;
  const province =
    normalizeProvinceCode(row.ProvinceCode || row.Province || row.ProvinceName) ||
    row.ProvinceCode;

  return {
    address1: line1 || row.Label || "",
    city: row.City,
    province,
    postalCode,
    country: "Canada",
  };
}

export async function retrieveCanadaPostAddress(id: string): Promise<AddressSelection | null> {
  const key = getAddressCompleteKey();
  if (!key) return null;

  const url = new URL(RETRIEVE_URL);
  url.searchParams.set("Key", key);
  url.searchParams.set("Id", id);

  const data = await fetchJson(url);
  const items = (data.Items as Array<Record<string, string>>) || [];
  const row = items[0];
  if (!row) return null;

  const address = parseRetrieveRow(row);
  if (!address.address1) return null;
  return address;
}

/** Drill down Find results until we can Retrieve a full address. */
export async function resolveCanadaPostAddress(
  id: string,
  searchTerm: string,
  initialNext?: string
): Promise<AddressSelection | null> {
  if (initialNext === "Retrieve") {
    return retrieveCanadaPostAddress(id);
  }

  let currentId = id;
  for (let step = 0; step < 8; step++) {
    const results = await findCanadaPostAddresses(searchTerm, currentId);
    if (!results.length) break;

    const picked = results.find((item) => item.next === "Retrieve") || results[0];
    currentId = picked.id;
    if (picked.next === "Retrieve") {
      return retrieveCanadaPostAddress(currentId);
    }
  }

  return null;
}
