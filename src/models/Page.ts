import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMediaRef {
  assetId?: string;
  url: string;
  alt?: string;
  caption?: string;
  credit?: string;
  focalPoint?: { x: number; y: number };
}

export interface IPageSection {
  key: string;
  type: string;
  enabled: boolean;
  order: number;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  items?: Array<Record<string, unknown>>;
  ctaText?: string;
  ctaUrl?: string;
  image?: IMediaRef;
  backgroundImage?: IMediaRef;
  foregroundImage?: IMediaRef;
  images?: IMediaRef[];
  stats?: Array<{ label: string; value: string }>;
  labels?: string[];
}

export interface IPage extends Document {
  slug: string;
  title: string;
  status: "draft" | "published";
  sections: IPageSection[];
  seo: {
    title?: string;
    description?: string;
    ogImage?: string;
    canonical?: string;
  };
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

const PageSectionSchema = new Schema(
  {
    key: { type: String, required: true },
    type: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    eyebrow: String,
    heading: String,
    subheading: String,
    body: String,
    items: [Schema.Types.Mixed],
    ctaText: String,
    ctaUrl: String,
    image: MediaRefSchema,
    backgroundImage: MediaRefSchema,
    foregroundImage: MediaRefSchema,
    images: [MediaRefSchema],
    stats: [{ label: String, value: String }],
    labels: [String],
  },
  { _id: false }
);

const PageSchema = new Schema<IPage>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    sections: [PageSectionSchema],
    seo: {
      title: String,
      description: String,
      ogImage: String,
      canonical: String,
    },
  },
  { timestamps: true }
);

const Page: Model<IPage> = mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);

export default Page;
