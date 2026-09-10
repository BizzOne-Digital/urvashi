import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomizeSubmission extends Document {
  referenceNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  artworkAssetId: string;
  artworkAssetIds?: string[];
  productSlug?: string;
  productName?: string;
  quantity?: number;
  preferDesign: boolean;
  baseFee: number;
  designFee: number;
  shippingCost: number;
  tax: number;
  taxLabel?: string;
  shippingMethod?: string;
  shipping?: {
    address1?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  totalPaid: number;
  currency: string;
  paymentStatus: "not_required" | "pending" | "paid" | "failed";
  stripeSessionId?: string;
  monerisTicket?: string;
  contactMessageId?: mongoose.Types.ObjectId;
  status: "new" | "design_in_progress" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const CustomizeSubmissionSchema = new Schema<ICustomizeSubmission>(
  {
    referenceNumber: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    artworkAssetId: { type: String, required: true },
    artworkAssetIds: [String],
    productSlug: String,
    productName: String,
    quantity: Number,
    preferDesign: { type: Boolean, default: false },
    baseFee: { type: Number, default: 0 },
    designFee: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    taxLabel: String,
    shippingMethod: String,
    shipping: {
      address1: String,
      city: String,
      province: String,
      postalCode: String,
      country: String,
    },
    totalPaid: { type: Number, default: 0 },
    currency: { type: String, default: "CAD" },
    paymentStatus: {
      type: String,
      enum: ["not_required", "pending", "paid", "failed"],
      default: "not_required",
      index: true,
    },
    stripeSessionId: String,
    monerisTicket: String,
    contactMessageId: { type: Schema.Types.ObjectId, ref: "ContactMessage" },
    status: {
      type: String,
      enum: ["new", "design_in_progress", "completed", "cancelled"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

const CustomizeSubmission: Model<ICustomizeSubmission> =
  mongoose.models.CustomizeSubmission ||
  mongoose.model<ICustomizeSubmission>("CustomizeSubmission", CustomizeSubmissionSchema);

export default CustomizeSubmission;
