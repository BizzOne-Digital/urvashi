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

function isCanadaPostConfigured(): boolean {
  return Boolean(
    process.env.CANADA_POST_USERNAME &&
      process.env.CANADA_POST_PASSWORD &&
      process.env.COMMERCE_ORIGIN_POSTAL_CODE
  );
}

function parsePriceQuotes(xml: string, serviceCodes: string[]): Map<string, number> {
  const prices = new Map<string, number>();
  for (const code of serviceCodes) {
    const blockRegex = new RegExp(
      `<service-code>${code}</service-code>[\\s\\S]*?<price>([\\d.]+)</price>`,
      "i"
    );
    const match = xml.match(blockRegex);
    if (match) prices.set(code, parseFloat(match[1]));
  }
  return prices;
}

async function fetchCanadaPostRates(
  originPostal: string,
  destinationPostal: string,
  parcel: ParcelSpec,
  serviceCodes: string[]
): Promise<Map<string, number>> {
  const username = process.env.CANADA_POST_USERNAME!;
  const password = process.env.CANADA_POST_PASSWORD!;
  const isProd = process.env.CANADA_POST_USE_PRODUCTION === "true";
  const base = isProd
    ? "https://soa-gw.canadapost.ca"
    : "https://ct.soa-gw.canadapost.ca";

  const serviceXml = serviceCodes.map((c) => `<service-code>${c}</service-code>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mailing-scenario xmlns="http://www.canadapost.ca/ws/shipment-v8">
  <origin-postal-code>${normalizePostal(originPostal)}</origin-postal-code>
  <destination>
    <domestic>
      <postal-code>${normalizePostal(destinationPostal)}</postal-code>
    </domestic>
  </destination>
  <parcel-characteristics>
    <weight>${parcel.weightKg}</weight>
    <dimensions>
      <length>${parcel.lengthCm}</length>
      <width>${parcel.widthCm}</width>
      <height>${parcel.heightCm}</height>
    </dimensions>
  </parcel-characteristics>
  <services>
    ${serviceXml}
  </services>
</mailing-scenario>`;

  const auth = Buffer.from(`${username}:${password}`).toString("base64");
  const res = await fetch(`${base}/rs/shipment/price`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/vnd.cpc.shipment-v8+xml",
      Accept: "application/vnd.cpc.shipment-v8+xml",
    },
    body: xml,
    signal: AbortSignal.timeout(12000),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("Canada Post rating error:", res.status, text.slice(0, 500));
    throw new Error("Canada Post rate lookup failed");
  }

  return parsePriceQuotes(text, serviceCodes);
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

export async function getShippingRates(
  originPostal: string,
  destinationPostal: string,
  parcel: ParcelSpec,
  options: { pickupEnabled?: boolean; currency?: string }
): Promise<ShippingRateQuote[]> {
  const currency = options.currency || "CAD";
  const dest = normalizePostal(destinationPostal);
  if (!dest || dest.length < 6) {
    return options.pickupEnabled ? [buildPickupQuote(currency)] : [];
  }

  const serviceCodes = [
    SHIPPING_METHODS.canada_post_standard.serviceCode,
    SHIPPING_METHODS.canada_post_express.serviceCode,
  ];

  let priceMap: Map<string, number>;
  try {
    if (isCanadaPostConfigured()) {
      priceMap = await fetchCanadaPostRates(
        originPostal,
        dest,
        parcel,
        serviceCodes
      );
    } else {
      priceMap = estimateRates(parcel);
    }
  } catch {
    priceMap = estimateRates(parcel);
  }

  const quotes: ShippingRateQuote[] = [];

  const standardPrice = priceMap.get(SHIPPING_METHODS.canada_post_standard.serviceCode);
  if (standardPrice != null) {
    quotes.push({
      id: "canada_post_standard",
      serviceCode: SHIPPING_METHODS.canada_post_standard.serviceCode,
      label: SHIPPING_METHODS.canada_post_standard.label,
      description: SHIPPING_METHODS.canada_post_standard.description,
      price: standardPrice,
      currency,
      estimatedDays: "3–7 business days",
      tracked: true,
    });
  }

  const expressPrice = priceMap.get(SHIPPING_METHODS.canada_post_express.serviceCode);
  if (expressPrice != null) {
    quotes.push({
      id: "canada_post_express",
      serviceCode: SHIPPING_METHODS.canada_post_express.serviceCode,
      label: SHIPPING_METHODS.canada_post_express.label,
      description: SHIPPING_METHODS.canada_post_express.description,
      price: expressPrice,
      currency,
      estimatedDays: "1–3 business days",
      tracked: true,
    });
  }

  if (options.pickupEnabled) {
    quotes.push(buildPickupQuote(currency));
  }

  return quotes;
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

export function getOriginPostalCode(settingsOrigin?: string): string {
  const fromEnv = process.env.COMMERCE_ORIGIN_POSTAL_CODE;
  if (fromEnv) return normalizePostal(fromEnv);
  if (settingsOrigin) {
    const match = settingsOrigin.match(/[A-Z]\d[A-Z]\s?\d[A-Z]\d/i);
    if (match) return normalizePostal(match[0]);
  }
  return "K1A0B1";
}
