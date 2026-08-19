import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISocialLink {
  platform?: string;
  handle?: string;
  url?: string;
  isActive: boolean;
}

export interface ISiteSettings extends Document {
  general: {
    businessName: string;
    shortName: string;
    tagline: string;
    announcement?: string;
    announcementEnabled: boolean;
    logoPath: string;
    logoDarkPath?: string;
    logoLightPath?: string;
    defaultSeoTitle?: string;
    defaultSeoDescription?: string;
    currency: string;
  };
  brand: {
    colors: Record<string, string>;
    fonts: string[];
  };
  contact: {
    email: string;
    phone: string;
    phoneLink: string;
    whatsappLink: string;
    address?: string;
    businessHours?: string;
  };
  social: ISocialLink[];
  commerce: {
    manualInvoiceInstructions?: string;
    taxMode: "none" | "manual" | "configured";
    taxRate?: number;
    shippingModes: string[];
    pickupEnabled: boolean;
    returnNotes?: string;
    defaultStockBehavior: string;
    orderConfirmationCopy?: string;
  };
  customization: {
    acceptedFileTypes: string[];
    maxFileSizeMB: number;
    rightsConfirmationCopy: string;
    previewDisclaimer: string;
    artworkGuidance?: string;
  };
  booking: {
    availableDays?: string[];
    availableTimeWindows?: string[];
    methods: string[];
    confirmationCopy?: string;
  };
  footer: {
    description?: string;
    ctaText?: string;
    ctaUrl?: string;
    copyright?: string;
  };
  motion: {
    introEnabled: boolean;
    introOncePerSession: boolean;
    defaultIntensity: "low" | "medium" | "high";
  };
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    general: {
      businessName: { type: String, required: true },
      shortName: { type: String, required: true },
      tagline: String,
      announcement: String,
      announcementEnabled: { type: Boolean, default: false },
      logoPath: String,
      logoDarkPath: String,
      logoLightPath: String,
      defaultSeoTitle: String,
      defaultSeoDescription: String,
      currency: { type: String, default: "CAD" },
    },
    brand: {
      colors: { type: Map, of: String },
      fonts: [String],
    },
    contact: {
      email: String,
      phone: String,
      phoneLink: String,
      whatsappLink: String,
      address: String,
      businessHours: String,
    },
    social: [
      {
        platform: String,
        handle: String,
        url: String,
        isActive: { type: Boolean, default: false },
      },
    ],
    commerce: {
      manualInvoiceInstructions: String,
      taxMode: { type: String, enum: ["none", "manual", "configured"], default: "none" },
      taxRate: Number,
      shippingModes: [String],
      pickupEnabled: { type: Boolean, default: false },
      returnNotes: String,
      defaultStockBehavior: { type: String, default: "track" },
      orderConfirmationCopy: String,
    },
    customization: {
      acceptedFileTypes: { type: [String], default: ["image/png", "image/jpeg", "application/pdf"] },
      maxFileSizeMB: { type: Number, default: 25 },
      rightsConfirmationCopy: String,
      previewDisclaimer: String,
      artworkGuidance: String,
    },
    booking: {
      availableDays: [String],
      availableTimeWindows: [String],
      methods: [String],
      confirmationCopy: String,
    },
    footer: {
      description: String,
      ctaText: String,
      ctaUrl: String,
      copyright: String,
    },
    motion: {
      introEnabled: { type: Boolean, default: true },
      introOncePerSession: { type: Boolean, default: true },
      defaultIntensity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
