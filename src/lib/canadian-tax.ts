export interface TaxBreakdown {
  gst: number;
  pst: number;
  hst: number;
  qst: number;
  total: number;
  provinceCode: string;
  label: string;
}

const PROVINCE_ALIASES: Record<string, string> = {
  ab: "AB",
  alberta: "AB",
  bc: "BC",
  "british columbia": "BC",
  mb: "MB",
  manitoba: "MB",
  nb: "NB",
  "new brunswick": "NB",
  nl: "NL",
  "newfoundland and labrador": "NL",
  "newfoundland": "NL",
  ns: "NS",
  "nova scotia": "NS",
  nt: "NT",
  "northwest territories": "NT",
  nu: "NU",
  nunavut: "NU",
  on: "ON",
  ontario: "ON",
  pe: "PE",
  "prince edward island": "PE",
  qc: "QC",
  quebec: "QC",
  "québec": "QC",
  sk: "SK",
  saskatchewan: "SK",
  yt: "YT",
  yukon: "YT",
};

/** Canadian sales tax rates on taxable amount (subtotal + shipping). */
const PROVINCE_TAX: Record<
  string,
  { label: string; gst?: number; pst?: number; hst?: number; qst?: number }
> = {
  AB: { label: "GST 5%", gst: 0.05 },
  BC: { label: "GST 5% + PST 7%", gst: 0.05, pst: 0.07 },
  MB: { label: "GST 5% + PST 7%", gst: 0.05, pst: 0.07 },
  NB: { label: "HST 15%", hst: 0.15 },
  NL: { label: "HST 15%", hst: 0.15 },
  NS: { label: "HST 15%", hst: 0.15 },
  NT: { label: "GST 5%", gst: 0.05 },
  NU: { label: "GST 5%", gst: 0.05 },
  ON: { label: "HST 13%", hst: 0.13 },
  PE: { label: "HST 15%", hst: 0.15 },
  QC: { label: "GST 5% + QST 9.975%", gst: 0.05, qst: 0.09975 },
  SK: { label: "GST 5% + PST 6%", gst: 0.05, pst: 0.06 },
  YT: { label: "GST 5%", gst: 0.05 },
};

export function normalizeProvinceCode(province?: string): string | null {
  if (!province?.trim()) return null;
  const key = province.trim().toLowerCase();
  if (PROVINCE_ALIASES[key]) return PROVINCE_ALIASES[key];
  const upper = province.trim().toUpperCase();
  if (PROVINCE_TAX[upper]) return upper;
  return null;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function calculateCanadianTax(
  subtotal: number,
  shippingCost: number,
  province?: string
): TaxBreakdown | null {
  const code = normalizeProvinceCode(province);
  if (!code) return null;

  const rates = PROVINCE_TAX[code];
  const taxable = subtotal + shippingCost;

  let gst = 0;
  let pst = 0;
  let hst = 0;
  let qst = 0;

  if (rates.hst) {
    hst = round2(taxable * rates.hst);
  } else {
    if (rates.gst) gst = round2(taxable * rates.gst);
    if (rates.pst) pst = round2(taxable * rates.pst);
    if (rates.qst) {
      // Quebec: QST applies to subtotal + shipping + GST
      qst = round2((taxable + gst) * rates.qst);
    }
  }

  return {
    gst,
    pst,
    hst,
    qst,
    total: round2(gst + pst + hst + qst),
    provinceCode: code,
    label: rates.label,
  };
}
