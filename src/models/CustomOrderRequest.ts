import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomOrderRequest extends Document {
  requestNumber: string;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  productInterest?: string;
  productSlug?: string;
  quantity?: number;
  deadline?: Date;
  instructions?: string;
  designHelp?: boolean;
  estimatedTotal?: number;
  artworkAssetIds: string[];
  source: "cart" | "customizer" | "contact" | "booking" | "manual";
  status: "new" | "reviewing" | "needs-info" | "quoted" | "accepted" | "converted-to-order" | "declined" | "closed" | "spam";
  quoteAmount?: number;
  quoteCurrency?: string;
  quoteNotes?: string;
  adminNotes?: string;
  statusHistory: Array<{ status: string; note?: string; changedAt: Date }>;
  convertedOrderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomOrderRequestSchema = new Schema<ICustomOrderRequest>(
  {
    requestNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      email: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: String,
    },
    productInterest: String,
    productSlug: String,
    quantity: Number,
    deadline: Date,
    instructions: String,
    designHelp: { type: Boolean, default: false },
    estimatedTotal: Number,
    artworkAssetIds: [String],
    source: {
      type: String,
      enum: ["cart", "customizer", "contact", "booking", "manual"],
      default: "manual",
    },
    status: {
      type: String,
      enum: ["new", "reviewing", "needs-info", "quoted", "accepted", "converted-to-order", "declined", "closed", "spam"],
      default: "new",
      index: true,
    },
    quoteAmount: Number,
    quoteCurrency: String,
    quoteNotes: String,
    adminNotes: String,
    statusHistory: [
      { status: String, note: String, changedAt: { type: Date, default: Date.now } },
    ],
    convertedOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

const CustomOrderRequest: Model<ICustomOrderRequest> =
  mongoose.models.CustomOrderRequest ||
  mongoose.model<ICustomOrderRequest>("CustomOrderRequest", CustomOrderRequestSchema);

export default CustomOrderRequest;
