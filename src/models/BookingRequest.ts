import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBookingRequest extends Document {
  requestNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  requestType: string;
  preferredDate?: Date;
  preferredTimeWindow?: string;
  timezone?: string;
  flexibility?: string;
  productInterest?: string;
  approximateQuantity?: number;
  eventDate?: Date;
  message?: string;
  artworkAssetIds: string[];
  consentGiven: boolean;
  status: "new" | "contacted" | "proposed" | "confirmed" | "completed" | "cancelled" | "declined" | "spam";
  adminNotes?: string;
  statusHistory: Array<{ status: string; note?: string; changedAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const BookingRequestSchema = new Schema<IBookingRequest>(
  {
    requestNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
    },
    requestType: { type: String, required: true },
    preferredDate: Date,
    preferredTimeWindow: String,
    timezone: String,
    flexibility: String,
    productInterest: String,
    approximateQuantity: Number,
    eventDate: Date,
    message: String,
    artworkAssetIds: [String],
    consentGiven: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["new", "contacted", "proposed", "confirmed", "completed", "cancelled", "declined", "spam"],
      default: "new",
      index: true,
    },
    adminNotes: String,
    statusHistory: [
      { status: String, note: String, changedAt: { type: Date, default: Date.now } },
    ],
  },
  { timestamps: true }
);

BookingRequestSchema.index({ preferredDate: 1 });

const BookingRequest: Model<IBookingRequest> =
  mongoose.models.BookingRequest ||
  mongoose.model<IBookingRequest>("BookingRequest", BookingRequestSchema);

export default BookingRequest;
