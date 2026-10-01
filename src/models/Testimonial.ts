import mongoose, { Schema, Document, Model } from "mongoose";
import { IMediaRef } from "./Page";

export interface ITestimonial extends Document {
  customerName: string;
  title?: string;
  location?: string;
  testimonial: string;
  rating?: number;
  productId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  image?: IMediaRef;
  order: number;
  featured: boolean;
  isDemo: boolean;
  status: "draft" | "published" | "archived";
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

const TestimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true },
    title: String,
    location: String,
    testimonial: { type: String, required: true },
    rating: Number,
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    image: MediaRefSchema,
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    isDemo: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published", "archived"], default: "published", index: true },
  },
  { timestamps: true }
);

const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

export default Testimonial;
