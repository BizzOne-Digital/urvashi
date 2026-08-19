import { connectDB } from "./db";
import SiteSettings, { ISiteSettings } from "@/models/SiteSettings";
import { siteDefaults, brandColors } from "./brand";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "./revalidation";

const defaultSettings: Partial<ISiteSettings> = {
  general: {
    businessName: siteDefaults.businessName,
    shortName: siteDefaults.shortName,
    tagline: siteDefaults.tagline,
    announcement: "",
    announcementEnabled: false,
    logoPath: siteDefaults.logoPath,
    currency: siteDefaults.currency,
  },
  brand: {
    colors: brandColors as unknown as Record<string, string>,
    fonts: ["Inter", "system-ui"],
  },
  contact: {
    email: siteDefaults.email,
    phone: siteDefaults.phone,
    phoneLink: siteDefaults.phoneLink,
    whatsappLink: siteDefaults.whatsappLink,
  },
  social: [{ handle: siteDefaults.socialHandle, isActive: false }],
  commerce: {
    taxMode: "none",
    shippingModes: [],
    pickupEnabled: false,
    defaultStockBehavior: "track",
    manualInvoiceInstructions:
      "We will send you an invoice with final pricing including shipping and taxes before payment is required.",
  },
  customization: {
    acceptedFileTypes: ["image/png", "image/jpeg", "application/pdf"],
    maxFileSizeMB: 25,
    rightsConfirmationCopy:
      "I confirm that I have the right to use this artwork for printing purposes.",
    previewDisclaimer:
      "Preview only — final placement, colour, and sizing may vary from what is shown on screen.",
  },
  booking: {
    methods: ["Phone call", "WhatsApp consultation", "Video call", "Design review", "Large/custom order", "Other"],
    confirmationCopy:
      "Your consultation request has been received. We will contact you to confirm availability — this is not a confirmed appointment.",
  },
  footer: {
    description: siteDefaults.tagline,
    ctaText: "Start your custom order",
    ctaUrl: "/customize",
    copyright: `© ${new Date().getFullYear()} DPM Custom Prints and Ink Supplies`,
  },
  motion: {
    introEnabled: true,
    introOncePerSession: true,
    defaultIntensity: "medium",
  },
};

export async function getSettings(): Promise<ISiteSettings> {
  try {
    await connectDB();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(defaultSettings);
    }
    return settings;
  } catch {
    return defaultSettings as ISiteSettings;
  }
}

export const getCachedSettings = unstable_cache(
  async () => getSettings(),
  ["site-settings"],
  { tags: [CACHE_TAGS.settings], revalidate: 60 }
);

export function getActiveSocialLinks(settings: ISiteSettings) {
  return (settings.social || []).filter((s) => s.isActive && s.url);
}
