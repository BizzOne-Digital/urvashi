import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContactMessage extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  inquiryType: string;
  productInterest?: string;
  serviceInterest?: string;
  quantity?: number;
  deadline?: Date;
  message: string;
  artworkAssetIds: string[];
  consentGiven: boolean;
  status: "new" | "read" | "replied" | "archived" | "spam";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    inquiryType: { type: String, required: true },
    productInterest: String,
    serviceInterest: String,
    quantity: Number,
    deadline: Date,
    message: { type: String, required: true },
    artworkAssetIds: [String],
    consentGiven: { type: Boolean, default: false },
    status: { type: String, enum: ["new", "read", "replied", "archived", "spam"], default: "new", index: true },
    adminNotes: String,
  },
  { timestamps: true }
);

const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

export default ContactMessage;
