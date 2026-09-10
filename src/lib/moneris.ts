export type MonerisEnvironment = "qa" | "prod";

export interface MonerisConfig {
  storeId: string;
  apiToken: string;
  checkoutId: string;
  environment: MonerisEnvironment;
}

export interface MonerisAddressDetails {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
}

export interface MonerisCartItem {
  description: string;
  productCode?: string;
  unitCost: number;
  quantity?: number;
}

export interface MonerisPreloadOptions {
  txnTotal: number;
  orderNo?: string;
  contactDetails?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  shippingDetails?: MonerisAddressDetails;
  billingDetails?: MonerisAddressDetails;
  cartItems?: MonerisCartItem[];
}

function scrubMonerisField(value?: string, max = 50): string | undefined {
  if (!value?.trim()) return undefined;
  return value.trim().replace(/[<>$%=?^{}[\]\\]/g, "").slice(0, max);
}

function toMonerisCountryCode(country?: string): string {
  const value = (country || "Canada").trim().toUpperCase();
  if (value === "CA" || value === "CANADA") return "CA";
  if (value.length === 2) return value;
  return "CA";
}

function buildMonerisAddressPayload(details?: MonerisAddressDetails) {
  const address1 = scrubMonerisField(details?.address1);
  if (!address1) return undefined;

  const province = scrubMonerisField(details?.province, 3)?.toUpperCase();

  return {
    address_1: address1,
    address_2: scrubMonerisField(details?.address2) || "",
    city: scrubMonerisField(details?.city) || "",
    province: province || "",
    country: toMonerisCountryCode(details?.country),
    postal_code: scrubMonerisField(details?.postalCode?.replace(/\s+/g, " "), 20) || "",
  };
}

interface MonerisApiResponse {
  response?: {
    success?: string;
    ticket?: string;
    error?: { message?: string };
    receipt?: {
      cc?: { response_code?: string; amount?: string };
      response_code?: string;
    };
    request?: { txn_total?: string };
  };
}

const GATEWAY_URLS: Record<MonerisEnvironment, string> = {
  qa: "https://gatewayt.moneris.com/chkt/request/request.php",
  prod: "https://gateway.moneris.com/chkt/request/request.php",
};

export function getMonerisEnvironment(): MonerisEnvironment {
  const env = process.env.MONERIS_ENVIRONMENT?.trim().toLowerCase();
  return env === "prod" ? "prod" : "qa";
}

export function getMonerisConfig(): MonerisConfig | null {
  const storeId = process.env.MONERIS_STORE_ID?.trim();
  const apiToken = process.env.MONERIS_API_TOKEN?.trim();
  const checkoutId = process.env.MONERIS_CHECKOUT_ID?.trim();

  if (!storeId || !apiToken || !checkoutId) return null;

  return {
    storeId,
    apiToken,
    checkoutId,
    environment: getMonerisEnvironment(),
  };
}

export function isMonerisConfigured(): boolean {
  return getMonerisConfig() !== null;
}

export function getPublicMonerisMode(): MonerisEnvironment {
  const env = process.env.NEXT_PUBLIC_MONERIS_ENVIRONMENT?.trim().toLowerCase();
  if (env === "prod" || env === "qa") return env;
  return getMonerisEnvironment();
}

async function monerisRequest(
  config: MonerisConfig,
  payload: Record<string, unknown>
): Promise<MonerisApiResponse> {
  const res = await fetch(GATEWAY_URLS[config.environment], {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    return JSON.parse(text) as MonerisApiResponse;
  } catch {
    console.error("Moneris invalid JSON:", text.slice(0, 500));
    throw new Error("Invalid response from payment gateway");
  }
}

export async function monerisPreload(options: MonerisPreloadOptions): Promise<string> {
  const config = getMonerisConfig();
  if (!config) throw new Error("Moneris is not configured");

  const payload: Record<string, unknown> = {
    store_id: config.storeId,
    api_token: config.apiToken,
    checkout_id: config.checkoutId,
    txn_total: options.txnTotal.toFixed(2),
    environment: config.environment,
    action: "preload",
  };

  if (options.orderNo) payload.order_no = options.orderNo;

  if (options.contactDetails) {
    const { email, firstName, lastName, phone } = options.contactDetails;
    if (email || firstName || lastName || phone) {
      payload.contact_details = {
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
      };
    }
  }

  const shipping = buildMonerisAddressPayload(options.shippingDetails);
  if (shipping) payload.shipping_details = shipping;

  const billing = buildMonerisAddressPayload(options.billingDetails);
  if (billing) payload.billing_details = billing;

  if (options.cartItems?.length) {
    payload.cart = {
      items: options.cartItems.map((item, index) => ({
        description: item.description.slice(0, 100),
        product_code: item.productCode || `ITEM${index + 1}`,
        unit_cost: item.unitCost.toFixed(2),
        quantity: String(item.quantity ?? 1),
      })),
    };
  }

  const data = await monerisRequest(config, payload);

  if (data.response?.success !== "true" || !data.response.ticket) {
    const message = data.response?.error?.message || "Could not start Moneris checkout";
    throw new Error(message);
  }

  return data.response.ticket;
}

export async function monerisReceipt(ticket: string): Promise<MonerisApiResponse> {
  const config = getMonerisConfig();
  if (!config) throw new Error("Moneris is not configured");

  const data = await monerisRequest(config, {
    store_id: config.storeId,
    api_token: config.apiToken,
    checkout_id: config.checkoutId,
    ticket,
    environment: config.environment,
    action: "receipt",
  });

  return data;
}

export function isMonerisReceiptApproved(data: MonerisApiResponse): boolean {
  if (data.response?.success !== "true") return false;

  const responseCode =
    data.response.receipt?.cc?.response_code || data.response.receipt?.response_code;

  if (!responseCode) return true;

  const code = parseInt(responseCode, 10);
  return !Number.isNaN(code) && code < 50;
}

export function getMonerisReceiptAmount(data: MonerisApiResponse): number | null {
  const amount = data.response?.receipt?.cc?.amount || data.response?.request?.txn_total;
  if (!amount) return null;
  const parsed = parseFloat(amount);
  return Number.isNaN(parsed) ? null : parsed;
}
