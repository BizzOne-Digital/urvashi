import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMediaAsset extends Document {
  originalName: string;
  diskPath: string;
  publicUrl?: string;
  mimeType: string;
  bytes: number;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  credit?: string;
  category?: string;
  galleryCategoryId?: mongoose.Types.ObjectId;
  focalPoint?: { x: number; y: number };
  isPrivate: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  customerPublicationConsent: boolean;
  order: number;
  referenceCount: number;
  relatedProductId?: mongoose.Types.ObjectId;
  relatedServiceId?: mongoose.Types.ObjectId;
  uploadedBy?: string;
  variants?: Array<{ width: number; path: string; url: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    originalName: { type: String, required: true },
    diskPath: { type: String, required: true },
    publicUrl: String,
    mimeType: { type: String, required: true },
    bytes: { type: Number, required: true },
    width: Number,
    height: Number,
    alt: String,
    caption: String,
    credit: String,
    category: { type: String, index: true },
    galleryCategoryId: { type: Schema.Types.ObjectId, ref: "GalleryCategory" },
    focalPoint: { x: Number, y: Number },
    isPrivate: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    customerPublicationConsent: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    referenceCount: { type: Number, default: 0 },
    relatedProductId: { type: Schema.Types.ObjectId, ref: "Product" },
    relatedServiceId: { type: Schema.Types.ObjectId, ref: "Service" },
    uploadedBy: String,
    variants: [{ width: Number, path: String, url: String }],
  },
  { timestamps: true }
);

MediaAssetSchema.index({ originalName: "text", alt: "text", caption: "text" });

const MediaAsset: Model<IMediaAsset> =
  mongoose.models.MediaAsset || mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);

export default MediaAsset;
