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

export interface MonerisCartTax {
  amount: number;
  description?: string;
  rate?: number;
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
  /** Pre-tax line items (product, shipping, fees). Tax goes in `cartTax`, not as a line item. */
  cartItems?: MonerisCartItem[];
  cartTax?: MonerisCartTax;
}

import { normalizeProvinceCode } from "@/lib/canadian-tax";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function scrubMonerisField(value?: string, max = 50): string | undefined {
  if (!value?.trim()) return undefined;
  return value.trim().replace(/[<>$%=?^{}[\]\\]/g, "").slice(0, max);
}

function monerisProductCode(code?: string, index = 0): string {
  const raw = (code || `ITEM${index + 1}`).replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
  return raw || `ITEM${index + 1}`;
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

  const province =
    normalizeProvinceCode(details?.province) ||
    scrubMonerisField(details?.province, 2)?.toUpperCase() ||
    "";

  return {
    address_1: address1,
    address_2: scrubMonerisField(details?.address2) || "",
    city: scrubMonerisField(details?.city) || "",
    province: province || "",
    country: toMonerisCountryCode(details?.country),
    postal_code: scrubMonerisField(details?.postalCode?.replace(/\s+/g, " "), 20) || "",
  };
}

function shouldSendPreloadAddresses(): boolean {
  return process.env.MONERIS_PRELOAD_ADDRESSES?.trim().toLowerCase() === "true";
}

function extractMonerisErrorMessage(data: MonerisApiResponse): string {
  const err = data.response?.error;
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err && typeof err === "object") {
    if (typeof err.message === "string" && err.message.trim()) return err.message.trim();
    for (const value of Object.values(err)) {
      if (value && typeof value === "object" && "data" in value) {
        const nested = (value as { data?: unknown }).data;
        if (typeof nested === "string" && nested.trim()) return nested.trim();
      }
    }
  }
  if (typeof data.response?.message === "string" && data.response.message.trim()) {
    return data.response.message.trim();
  }
  return "Could not start Moneris checkout";
}

interface MonerisApiResponse {
  response?: {
    success?: string;
    ticket?: string;
    message?: string;
    error?: { message?: string; field?: string; code?: string } | string | Record<string, unknown>;
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
    txn_total: roundMoney(options.txnTotal).toFixed(2),
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

  // Most Moneris Checkout profiles with "shipping address" enabled reject preload shipping_details.
  if (shouldSendPreloadAddresses()) {
    const shipping = buildMonerisAddressPayload(options.shippingDetails);
    if (shipping) payload.shipping_details = shipping;

    const billing = buildMonerisAddressPayload(options.billingDetails);
    if (billing) payload.billing_details = billing;
  }

  if (options.cartItems?.length) {
    const items = options.cartItems.map((item, index) => ({
      description: item.description.slice(0, 50),
      product_code: monerisProductCode(item.productCode, index),
      unit_cost: roundMoney(item.unitCost).toFixed(2),
      quantity: String(item.quantity ?? 1),
    }));

    const subtotal = roundMoney(
      options.cartItems.reduce(
        (sum, item) => sum + roundMoney(item.unitCost) * (item.quantity ?? 1),
        0
      )
    );

    const taxAmount = options.cartTax ? roundMoney(options.cartTax.amount) : 0;
    const cartTotal = roundMoney(subtotal + taxAmount);
    const txnTotal = roundMoney(options.txnTotal);

    const cart: Record<string, unknown> = {
      items,
      subtotal: subtotal.toFixed(2),
    };

    if (taxAmount > 0) {
      cart.tax = {
        amount: taxAmount.toFixed(2),
        description: scrubMonerisField(options.cartTax?.description, 50) || "Tax",
        ...(options.cartTax?.rate != null ? { rate: options.cartTax.rate.toFixed(2) } : {}),
      };
    }

    payload.cart = cart;
    payload.txn_total =
      Math.abs(cartTotal - txnTotal) <= 0.02 ? cartTotal.toFixed(2) : txnTotal.toFixed(2);
  } else {
    payload.txn_total = roundMoney(options.txnTotal).toFixed(2);
  }

  const data = await monerisRequest(config, payload);

  if (data.response?.success !== "true" || !data.response.ticket) {
    console.error("Moneris preload failed:", JSON.stringify(data.response ?? data));
    throw new Error(extractMonerisErrorMessage(data));
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
