import mongoose, { Schema, Document, Model } from "mongoose";

export type StoredUploadAccess = "public" | "private";

export interface IStoredUpload extends Document {
  folder: string;
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
  access: StoredUploadAccess;
  originalName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoredUploadSchema = new Schema<IStoredUpload>(
  {
    folder: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
    access: { type: String, enum: ["public", "private"], default: "public" },
    originalName: String,
  },
  { timestamps: true }
);

StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });

const StoredUpload: Model<IStoredUpload> =
  mongoose.models.StoredUpload || mongoose.model<IStoredUpload>("StoredUpload", StoredUploadSchema);

export default StoredUpload;
