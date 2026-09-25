import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const ProductCategorySchema = new Schema<IProductCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    image: String,
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

const ProductCategory: Model<IProductCategory> =
  mongoose.models.ProductCategory ||
  mongoose.model<IProductCategory>("ProductCategory", ProductCategorySchema);

export default ProductCategory;
