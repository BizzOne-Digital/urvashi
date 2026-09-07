export type MonerisEnvironment = "qa" | "prod";

export interface MonerisConfig {
  storeId: string;
  apiToken: string;
  checkoutId: string;
  environment: MonerisEnvironment;
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
