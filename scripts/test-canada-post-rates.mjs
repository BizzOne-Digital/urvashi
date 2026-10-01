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

const username =
  process.env.CANADA_POST_USERNAME?.trim() || process.env.CANADA_POST_API_KEY?.trim();
const password =
  process.env.CANADA_POST_PASSWORD?.trim() || process.env.CANADA_POST_API_SECRET?.trim();
const customerNumber = process.env.CANADA_POST_CUSTOMER_NUMBER?.trim();
const origin = (process.env.COMMERCE_ORIGIN_POSTAL_CODE || "K1A0B1").replace(/\s+/g, "").toUpperCase();
const isProd = process.env.CANADA_POST_USE_PRODUCTION === "true";
const base = isProd ? "https://soa-gw.canadapost.ca" : "https://ct.soa-gw.canadapost.ca";

const parcel = { weightKg: 0.5, lengthCm: 25, widthCm: 20, heightCm: 10 };
const serviceCodes = ["DOM.RP", "DOM.EP"];

async function fetchRates(dest) {
  const customerXml = customerNumber ? `<customer-number>${customerNumber}</customer-number>` : "";
  const serviceXml = serviceCodes.map((c) => `<service-code>${c}</service-code>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mailing-scenario xmlns="http://www.canadapost.ca/ws/shipment-v8">
  ${customerXml}
  <origin-postal-code>${origin}</origin-postal-code>
  <destination>
    <domestic>
      <postal-code>${dest.replace(/\s+/g, "").toUpperCase()}</postal-code>
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
  });
  const text = await res.text();
  return { status: res.status, ok: res.ok, snippet: text.slice(0, 400) };
}

console.log({
  configured: Boolean(username && password && origin),
  isProd,
  origin,
});

for (const dest of ["M5V2H1", "V6B1A1", "T2P1J9", "INVALID1"]) {
  const result = await fetchRates(dest);
  console.log(dest, result.status, result.ok ? "ok" : "fail", result.snippet.replace(/\s+/g, " "));
}
