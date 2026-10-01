import mongoose, { Schema, Document, Model } from "mongoose";
import { IMediaRef } from "./Page";

export interface IServiceFAQ {
  question: string;
  answer: string;
}

export interface IService extends Document {
  title: string;
  slug: string;
  shortDescription?: string;
  cardImage?: IMediaRef;
  icon?: string;
  accentColor?: string;
  ctaText?: string;
  ctaUrl?: string;
  order: number;
  status: "draft" | "published" | "archived";
  detail: {
    heroImage?: IMediaRef;
    heroHeading?: string;
    heroSubheading?: string;
    overview?: string;
    suitableUses?: string[];
    productOptions?: string[];
    customizationOptions?: string[];
    artworkGuidance?: string;
    processSteps?: Array<{ title: string; description: string; image?: IMediaRef }>;
    pricingNote?: string;
    minimumOrderNote?: string;
    importantNotes?: string;
    sectionImages?: IMediaRef[];
    relatedProductIds?: mongoose.Types.ObjectId[];
    relatedServiceIds?: mongoose.Types.ObjectId[];
    faqs?: IServiceFAQ[];
    ctaText?: string;
    ctaUrl?: string;
  };
  seo: { title?: string; description?: string };
  createdAt: Date;
  updatedAt: Date;
}

const MediaRefSchema = new Schema(
  {
    assetId: String,
    url: { type: String, required: true },
    alt: String,
    caption: String,
    credit: String,
    focalPoint: { x: Number, y: Number },
  },
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: String,
    cardImage: MediaRefSchema,
    icon: String,
    accentColor: String,
    ctaText: String,
    ctaUrl: String,
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published", "archived"], default: "published", index: true },
    detail: {
      heroImage: MediaRefSchema,
      heroHeading: String,
      heroSubheading: String,
      overview: String,
      suitableUses: [String],
      productOptions: [String],
      customizationOptions: [String],
      artworkGuidance: String,
      processSteps: [
        {
          title: String,
          description: String,
          image: MediaRefSchema,
        },
      ],
      pricingNote: String,
      minimumOrderNote: String,
      importantNotes: String,
      sectionImages: [MediaRefSchema],
      relatedProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      relatedServiceIds: [{ type: Schema.Types.ObjectId, ref: "Service" }],
      faqs: [{ question: String, answer: String }],
      ctaText: String,
      ctaUrl: String,
    },
    seo: { title: String, description: String },
  },
  { timestamps: true }
);

const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);

export default Service;
