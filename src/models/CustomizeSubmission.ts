import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomizeSubmission extends Document {
  referenceNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  artworkAssetId: string;
  preferDesign: boolean;
  designFee: number;
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
    preferDesign: { type: Boolean, default: false },
    designFee: { type: Number, default: 0 },
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
