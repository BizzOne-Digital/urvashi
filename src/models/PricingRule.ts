import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPricingRule extends Document {
  productId?: mongoose.Types.ObjectId;
  productSlug?: string;
  productName?: string;
  basePrice?: number;
  currency: string;
  pricingMode: "fixed" | "quote";
  minQuantity: number;
  quantityTiers?: Array<{ minQty: number; price: number }>;
  variantSurcharges?: Array<{ variantName: string; optionValue: string; surcharge: number }>;
  printLocationSurcharges?: Array<{ locationId: string; surcharge: number }>;
  publicNote?: string;
  adminNote?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PricingRuleSchema = new Schema<IPricingRule>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", index: true },
    productSlug: { type: String, index: true },
    productName: String,
    basePrice: Number,
    currency: { type: String, default: "CAD" },
    pricingMode: { type: String, enum: ["fixed", "quote"], default: "fixed" },
    minQuantity: { type: Number, default: 1 },
    quantityTiers: [{ minQty: Number, price: Number }],
    variantSurcharges: [{ variantName: String, optionValue: String, surcharge: Number }],
    printLocationSurcharges: [{ locationId: String, surcharge: Number }],
    publicNote: String,
    adminNote: String,
    effectiveFrom: Date,
    effectiveTo: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PricingRule: Model<IPricingRule> =
  mongoose.models.PricingRule || mongoose.model<IPricingRule>("PricingRule", PricingRuleSchema);

export default PricingRule;
