import mongoose, { Schema, Document, Model } from "mongoose";
import { IMediaRef } from "./Page";

export interface IProductVariant {
  name: string;
  options: Array<{
    label: string;
    value: string;
    surcharge?: number;
  }>;
}

export interface IPrintLocation {
  id: string;
  label: string;
  surcharge?: number;
}

export interface ICustomizerConfig {
  enabled: boolean;
  templateType?: string;
  printArea?: { x: number; y: number; width: number; height: number };
  allowedFonts?: string[];
  allowedColors?: string[];
  previewDisclaimer?: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  categoryId?: mongoose.Types.ObjectId;
  categorySlug?: string;
  tags: string[];
  shortDescription?: string;
  longDescription?: string;
  pricingMode: "fixed" | "quote";
  price?: number;
  compareAtPrice?: number;
  currency: string;
  minQuantity: number;
  quantityStep: number;
  stock?: number;
  lowStockThreshold?: number;
  availability: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order" | "quote_only";
  variants: IProductVariant[];
  printLocations: IPrintLocation[];
  customizationFields: Array<{
    id: string;
    label: string;
    type: "text" | "textarea" | "select" | "artwork" | "instructions";
    required?: boolean;
    options?: string[];
    maxLength?: number;
  }>;
  optionSurcharges: Array<{ optionId: string; value: string; surcharge: number }>;
  images: IMediaRef[];
  blankImage?: IMediaRef;
  customizedImage?: IMediaRef;
  cardImage?: IMediaRef;
  allowsBlankPurchase: boolean;
  allowsCustomization: boolean;
  designHelpSurcharge: number;
  customizer: ICustomizerConfig;
  featured: boolean;
  onSale: boolean;
  status: "draft" | "published" | "archived";
  relatedProductIds: mongoose.Types.ObjectId[];
  relatedGalleryIds: mongoose.Types.ObjectId[];
  seo: { title?: string; description?: string };
  /** Parcel weight in grams for shipping rate quotes */
  weightGrams?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
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

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "ProductCategory" },
    categorySlug: { type: String, index: true },
    tags: [String],
    shortDescription: String,
    longDescription: String,
    pricingMode: { type: String, enum: ["fixed", "quote"], default: "fixed" },
    price: Number,
    compareAtPrice: Number,
    currency: { type: String, default: "CAD" },
    minQuantity: { type: Number, default: 1 },
    quantityStep: { type: Number, default: 1 },
    stock: Number,
    lowStockThreshold: { type: Number, default: 5 },
    availability: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock", "made_to_order", "quote_only"],
      default: "in_stock",
    },
    variants: [
      {
        name: String,
        options: [{ label: String, value: String, surcharge: Number }],
      },
    ],
    printLocations: [{ id: String, label: String, surcharge: Number }],
    customizationFields: [
      {
        id: String,
        label: String,
        type: { type: String, enum: ["text", "textarea", "select", "artwork", "instructions"] },
        required: Boolean,
        options: [String],
        maxLength: Number,
      },
    ],
    optionSurcharges: [{ optionId: String, value: String, surcharge: Number }],
    images: [MediaRefSchema],
    blankImage: MediaRefSchema,
    customizedImage: MediaRefSchema,
    cardImage: MediaRefSchema,
    allowsBlankPurchase: { type: Boolean, default: true },
    allowsCustomization: { type: Boolean, default: true },
    designHelpSurcharge: { type: Number, default: 5 },
    customizer: {
      enabled: { type: Boolean, default: false },
      templateType: String,
      printArea: { x: Number, y: Number, width: Number, height: Number },
      allowedFonts: [String],
      allowedColors: [String],
      previewDisclaimer: String,
    },
    featured: { type: Boolean, default: false, index: true },
    onSale: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published", "archived"], default: "published", index: true },
    relatedProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    relatedGalleryIds: [{ type: Schema.Types.ObjectId, ref: "MediaAsset" }],
    seo: { title: String, description: String },
    weightGrams: Number,
    lengthCm: Number,
    widthCm: Number,
    heightCm: Number,
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", shortDescription: "text", tags: "text" });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
