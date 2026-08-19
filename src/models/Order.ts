import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId?: string;
  productSlug?: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  pricingMode: "fixed" | "quote";
  customization?: {
    text?: string;
    font?: string;
    color?: string;
    printLocation?: string;
    instructions?: string;
    variantSelections?: Record<string, string>;
    previewAssetId?: string;
    artworkAssetId?: string;
    configSnapshot?: Record<string, unknown>;
  };
}

export interface IOrderStatusHistory {
  status: string;
  note?: string;
  changedAt: Date;
  changedBy?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  shipping?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    method?: string;
    notes?: string;
  };
  billing?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: "awaiting_payment" | "paid" | "refunded" | "cancelled";
  productionStatus: string;
  fulfillmentStatus: string;
  statusHistory: IOrderStatusHistory[];
  paymentMethod?: string;
  stripeSessionId?: string;
  adminNotes?: string;
  customerNotes?: string;
  accessToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      email: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: String,
    },
    shipping: {
      address1: String,
      address2: String,
      city: String,
      province: String,
      postalCode: String,
      country: String,
      method: String,
      notes: String,
    },
    billing: {
      address1: String,
      address2: String,
      city: String,
      province: String,
      postalCode: String,
      country: String,
    },
    items: [
      {
        productId: String,
        productSlug: String,
        productName: { type: String, required: true },
        sku: String,
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        lineTotal: { type: Number, required: true },
        pricingMode: { type: String, enum: ["fixed", "quote"], default: "fixed" },
        customization: {
          text: String,
          font: String,
          color: String,
          printLocation: String,
          instructions: String,
          variantSelections: Schema.Types.Mixed,
          previewAssetId: String,
          artworkAssetId: String,
          configSnapshot: Schema.Types.Mixed,
        },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "CAD" },
    paymentStatus: {
      type: String,
      enum: ["awaiting_payment", "paid", "refunded", "cancelled"],
      default: "awaiting_payment",
      index: true,
    },
    productionStatus: { type: String, default: "inquiry", index: true },
    fulfillmentStatus: { type: String, default: "pending", index: true },
    statusHistory: [
      {
        status: String,
        note: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: String,
      },
    ],
    paymentMethod: String,
    stripeSessionId: String,
    adminNotes: String,
    customerNotes: String,
    accessToken: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
