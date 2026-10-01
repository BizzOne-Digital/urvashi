import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomerArtwork extends Document {
  originalName: string;
  diskPath: string;
  storedUploadId?: mongoose.Types.ObjectId;
  mimeType: string;
  bytes: number;
  checksum?: string;
  orderId?: mongoose.Types.ObjectId;
  cartSessionId?: string;
  customOrderId?: mongoose.Types.ObjectId;
  contactMessageId?: mongoose.Types.ObjectId;
  bookingRequestId?: mongoose.Types.ObjectId;
  customerNote?: string;
  rightsConfirmed: boolean;
  retentionUntil?: Date;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerArtworkSchema = new Schema<ICustomerArtwork>(
  {
    originalName: { type: String, required: true },
    diskPath: { type: String, required: true },
    storedUploadId: { type: Schema.Types.ObjectId, ref: "StoredUpload" },
    mimeType: { type: String, required: true },
    bytes: { type: Number, required: true },
    checksum: String,
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    cartSessionId: String,
    customOrderId: { type: Schema.Types.ObjectId, ref: "CustomOrderRequest" },
    contactMessageId: { type: Schema.Types.ObjectId, ref: "ContactMessage" },
    bookingRequestId: { type: Schema.Types.ObjectId, ref: "BookingRequest" },
    customerNote: String,
    rightsConfirmed: { type: Boolean, default: false },
    retentionUntil: Date,
    uploadedBy: String,
  },
  { timestamps: true }
);

const CustomerArtwork: Model<ICustomerArtwork> =
  mongoose.models.CustomerArtwork ||
  mongoose.model<ICustomerArtwork>("CustomerArtwork", CustomerArtworkSchema);

export default CustomerArtwork;
