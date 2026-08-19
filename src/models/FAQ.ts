import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  relatedProductId?: mongoose.Types.ObjectId;
  relatedServiceId?: mongoose.Types.ObjectId;
  relatedPageSlug?: string;
  order: number;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, required: true, index: true },
    relatedProductId: { type: Schema.Types.ObjectId, ref: "Product" },
    relatedServiceId: { type: Schema.Types.ObjectId, ref: "Service" },
    relatedPageSlug: String,
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published", "archived"], default: "published", index: true },
  },
  { timestamps: true }
);

FAQSchema.index({ question: "text", answer: "text" });

const FAQ: Model<IFAQ> = mongoose.models.FAQ || mongoose.model<IFAQ>("FAQ", FAQSchema);

export default FAQ;
