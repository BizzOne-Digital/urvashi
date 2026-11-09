import type { ParcelSpec } from "@/lib/shipping-parcel";

export const SHIPPING_METHODS = {
  canada_post_standard: {
    id: "canada_post_standard",
    serviceCode: "DOM.RP",
    label: "Canada Post Standard",
    description: "Regular Parcel with tracking (3–7 business days)",
  },
  canada_post_express: {
    id: "canada_post_express",
    serviceCode: "DOM.EP",
    label: "Canada Post Express",
    description: "Expedited Parcel with tracking (1–3 business days)",
  },
  pickup: {
    id: "pickup",
    serviceCode: "PICKUP",
    label: "Local pickup",
    description: "Pick up at our location — no shipping charge",
  },
} as const;

export type ShippingMethodId = keyof typeof SHIPPING_METHODS;

export interface ShippingRateQuote {
  id: ShippingMethodId;
  serviceCode: string;
  label: string;
  description: string;
  price: number;
  currency: string;
  estimatedDays?: string;
  tracked: boolean;
}

function normalizePostal(postal?: string): string {
  return (postal || "").replace(/\s+/g, "").toUpperCase();
}

function getCanadaPostCredentials() {
  const apiKey = process.env.CANADA_POST_API_KEY?.trim();
  const apiSecret = process.env.CANADA_POST_API_SECRET?.trim();
  const customerNumber = process.env.CANADA_POST_CUSTOMER_NUMBER?.trim();
  const contractId = process.env.CANADA_POST_CONTRACT_ID?.trim();
  return { apiKey, apiSecret, customerNumber, contractId };
}

function isCanadaPostConfigured(): boolean {
  const { apiKey, apiSecret } = getCanadaPostCredentials();
  const origin = process.env.COMMERCE_ORIGIN_POSTAL_CODE?.trim();
  return Boolean(apiKey && apiSecret && origin);
}

// Canada Post Developer Portal REST API (Rating 4.x): OAuth 2.0 client credentials + JSON.
const API_GATEWAY =
  process.env.CANADA_POST_API_GATEWAY?.trim() ||
  "https://api.canadapost-postescanada.ca/prod/devportal-portaildesdeveloppeurs";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const { apiKey, apiSecret } = getCanadaPostCredentials();
  if (!apiKey || !apiSecret) throw new Error("Canada Post credentials missing");

  const res = await fetch(`${API_GATEWAY}/cpc-api-native-oauth-provider/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-IBM-Client-Id": apiKey,
      "X-IBM-Client-Secret": apiSecret,
    },
    body: "scope=merchant&grant_type=client_credentials",
    signal: AbortSignal.timeout(12000),
  });

  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!res.ok || !data.access_token) {
    console.error("Canada Post token error:", res.status, data.error);
    throw new Error(`Canada Post authentication failed (${res.status})`);
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

interface PriceQuoteJson {
  serviceCode?: string;
  priceDetails?: {
    due?: number | string;
    taxes?: Record<string, { amt?: number | string } | undefined>;
  };
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * The quoted "due" amount includes GST/HST/PST. Tax is added separately at checkout,
 * so return the pre-tax amount (base + surcharges) to avoid charging tax twice.
 */
function parsePriceQuotes(json: unknown, serviceCodes: string[]): Map<string, number> {
  const prices = new Map<string, number>();
  const quotes: PriceQuoteJson[] = Array.isArray(json)
    ? json
    : ((json as { priceQuotes?: PriceQuoteJson[] })?.priceQuotes ?? []);

  for (const quote of quotes) {
    const code = quote.serviceCode?.trim();
    if (!code || !serviceCodes.includes(code)) continue;

    const due = num(quote.priceDetails?.due);
    if (!due) continue;

    const taxes = quote.priceDetails?.taxes ?? {};
    const tax = num(taxes.gst?.amt) + num(taxes.pst?.amt) + num(taxes.hst?.amt);
    prices.set(code, Math.round((due - tax) * 100) / 100);
  }

  return prices;
}

async function fetchCanadaPostRates(
  originPostal: string,
  destinationPostal: string,
  parcel: ParcelSpec,
  serviceCodes: string[]
): Promise<Map<string, number>> {
  const { customerNumber, contractId } = getCanadaPostCredentials();
  const quoteType =
    process.env.CANADA_POST_QUOTE_TYPE?.trim() || (customerNumber ? "commercial" : "counter");

  const body = {
    ...(customerNumber ? { customerNumber } : {}),
    ...(customerNumber && contractId ? { contractId } : {}),
    quoteType,
    parcelCharacteristics: {
      weight: Number(parcel.weightKg.toFixed(3)),
      dimensions: {
        length: Number(parcel.lengthCm.toFixed(1)),
        width: Number(parcel.widthCm.toFixed(1)),
        height: Number(parcel.heightCm.toFixed(1)),
      },
    },
    services: serviceCodes,
    originPostalCode: normalizePostal(originPostal),
    destination: { domestic: { postalCode: normalizePostal(destinationPostal) } },
  };

  const send = async (forceRefresh: boolean) =>
    fetch(`${API_GATEWAY}/rating/v1/prices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getAccessToken(forceRefresh)}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Language": "en-CA",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    });

  let res = await send(false);
  if (res.status === 401) res = await send(true);

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data as { detail?: string; title?: string; errors?: { message?: string }[] } | null;
    const detail = err?.errors?.[0]?.message || err?.detail || err?.title;
    console.error("Canada Post rating error:", res.status, JSON.stringify(data)?.slice(0, 500));
    throw new Error(
      detail
        ? `Canada Post rate lookup failed: ${detail}`
        : `Canada Post rate lookup failed (${res.status})`
    );
  }

  const prices = parsePriceQuotes(data, serviceCodes);
  if (prices.size === 0) {
    console.error("Canada Post rating empty quotes:", JSON.stringify(data)?.slice(0, 500));
    throw new Error("Canada Post returned no rates for this postal code");
  }

  return prices;
}

/** Estimate rates when Canada Post API credentials are not configured. */
function estimateRates(parcel: ParcelSpec): Map<string, number> {
  const kg = parcel.weightKg;
  const base = 11.99 + Math.max(0, kg - 0.5) * 4.5;
  const standard = Math.round(base * 100) / 100;
  const express = Math.round((base * 1.55 + 4) * 100) / 100;
  return new Map([
    ["DOM.RP", standard],
    ["DOM.EP", express],
  ]);
}

export type ShippingRateSource = "canada_post" | "estimate";

export interface ShippingRatesResult {
  rates: ShippingRateQuote[];
  rateSource: ShippingRateSource;
}

export async function getShippingRates(
  originPostal: string,
  destinationPostal: string,
  parcel: ParcelSpec,
  options: { pickupEnabled?: boolean; currency?: string }
): Promise<ShippingRatesResult> {
  const currency = options.currency || "CAD";
  const dest = normalizePostal(destinationPostal);
  if (!dest || dest.length < 6) {
    const rates = options.pickupEnabled ? [buildPickupQuote(currency)] : [];
    return { rates, rateSource: "estimate" };
  }

  const serviceCodes = [
    SHIPPING_METHODS.canada_post_standard.serviceCode,
    SHIPPING_METHODS.canada_post_express.serviceCode,
  ];

  let priceMap: Map<string, number>;
  let rateSource: ShippingRateSource;

  if (isCanadaPostConfigured()) {
    try {
      priceMap = await fetchCanadaPostRates(originPostal, dest, parcel, serviceCodes);
      rateSource = "canada_post";
    } catch (error) {
      // Never silently charge customers made-up prices when live rating is configured.
      if (process.env.CANADA_POST_ALLOW_ESTIMATE_FALLBACK !== "true") {
        throw error;
      }
      console.warn("[canada-post] Live rating failed, using estimate:", error);
      priceMap = estimateRates(parcel);
      rateSource = "estimate";
    }
  } else {
    priceMap = estimateRates(parcel);
    rateSource = "estimate";
  }

  const quotes: ShippingRateQuote[] = [];
  const methods = [
    [SHIPPING_METHODS.canada_post_standard, "3–7 business days"],
    [SHIPPING_METHODS.canada_post_express, "1–3 business days"],
  ] as const;

  for (const [method, estimatedDays] of methods) {
    const price = priceMap.get(method.serviceCode);
    if (price == null) continue;
    quotes.push({
      id: method.id,
      serviceCode: method.serviceCode,
      label: method.label,
      description: method.description,
      price,
      currency,
      estimatedDays,
      tracked: true,
    });
  }

  if (options.pickupEnabled) {
    quotes.push(buildPickupQuote(currency));
  }

  return { rates: quotes, rateSource };
}

function buildPickupQuote(currency: string): ShippingRateQuote {
  return {
    id: "pickup",
    serviceCode: SHIPPING_METHODS.pickup.serviceCode,
    label: SHIPPING_METHODS.pickup.label,
    description: SHIPPING_METHODS.pickup.description,
    price: 0,
    currency,
    tracked: false,
  };
}

export function getShippingCostForMethod(
  methodId: string,
  quotes: ShippingRateQuote[]
): number | null {
  const quote = quotes.find((q) => q.id === methodId);
  return quote ? quote.price : null;
}

export function isCanadaPostApiEnabled(): boolean {
  return isCanadaPostConfigured();
}

export function getOriginPostalCode(settingsOrigin?: string): string {
  const fromEnv = process.env.COMMERCE_ORIGIN_POSTAL_CODE;
  if (fromEnv) return normalizePostal(fromEnv);
  if (settingsOrigin) {
    const match = settingsOrigin.match(/[A-Z]\d[A-Z]\s?\d[A-Z]\d/i);
    if (match) return normalizePostal(match[0]);
  }
  return "K1A0B1";
}
