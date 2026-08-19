import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGalleryCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  order: number;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const GalleryCategorySchema = new Schema<IGalleryCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    coverImage: String,
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

const GalleryCategory: Model<IGalleryCategory> =
  mongoose.models.GalleryCategory ||
  mongoose.model<IGalleryCategory>("GalleryCategory", GalleryCategorySchema);

export default GalleryCategory;
