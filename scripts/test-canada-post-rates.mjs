import { readFileSync } from "fs";

function loadEnv() {
  try {
    const raw = readFileSync(".env", "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* no .env */
  }
}

loadEnv();

const apiKey = process.env.CANADA_POST_API_KEY?.trim();
const apiSecret = process.env.CANADA_POST_API_SECRET?.trim();
const customerNumber = process.env.CANADA_POST_CUSTOMER_NUMBER?.trim();
const contractId = process.env.CANADA_POST_CONTRACT_ID?.trim();
const quoteType =
  process.env.CANADA_POST_QUOTE_TYPE?.trim() || (customerNumber ? "commercial" : "counter");
const origin = (process.env.COMMERCE_ORIGIN_POSTAL_CODE || "K1A0B1").replace(/\s+/g, "").toUpperCase();
const gateway =
  process.env.CANADA_POST_API_GATEWAY?.trim() ||
  "https://api.canadapost-postescanada.ca/prod/devportal-portaildesdeveloppeurs";

const parcel = { weightKg: 0.5, lengthCm: 25, widthCm: 20, heightCm: 10 };
const serviceCodes = ["DOM.RP", "DOM.EP"];

async function getToken() {
  const res = await fetch(`${gateway}/cpc-api-native-oauth-provider/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-IBM-Client-Id": apiKey,
      "X-IBM-Client-Secret": apiSecret,
    },
    body: "scope=merchant&grant_type=client_credentials",
  });
  const data = await res.json().catch(() => ({}));
  console.log("token", res.status, data.access_token ? "ok" : data.error || "fail");
  return data.access_token;
}

async function fetchRates(token, dest) {
  const body = {
    ...(customerNumber ? { customerNumber } : {}),
    ...(customerNumber && contractId ? { contractId } : {}),
    quoteType,
    parcelCharacteristics: {
      weight: parcel.weightKg,
      dimensions: { length: parcel.lengthCm, width: parcel.widthCm, height: parcel.heightCm },
    },
    services: serviceCodes,
    originPostalCode: origin,
    destination: { domestic: { postalCode: dest.replace(/\s+/g, "").toUpperCase() } },
  };
  const res = await fetch(`${gateway}/rating/v1/prices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Language": "en-CA",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, ok: res.ok, snippet: text.slice(0, 700) };
}

console.log({ configured: Boolean(apiKey && apiSecret && origin), origin, quoteType });

const token = await getToken();
if (token) {
  for (const dest of ["M5V2H1", "V6B1A1", "T2P1J9", "INVALID1"]) {
    const result = await fetchRates(token, dest);
    console.log(dest, result.status, result.ok ? "ok" : "fail", result.snippet.replace(/\s+/g, " "));
  }
}
