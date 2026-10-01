import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  authorName?: string;
  category?: string;
  tags: string[];
  body: string;
  inlineImages?: Array<{ url: string; alt?: string; caption?: string }>;
  status: "draft" | "published" | "archived";
  isDemo: boolean;
  publishedAt?: Date;
  seo: { title?: string; description?: string };
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: String,
    coverImage: String,
    authorName: String,
    category: String,
    tags: [String],
    body: { type: String, required: true },
    inlineImages: [{ url: String, alt: String, caption: String }],
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    isDemo: { type: Boolean, default: false },
    publishedAt: Date,
    seo: { title: String, description: String },
  },
  { timestamps: true }
);

BlogPostSchema.index({ title: "text", excerpt: "text", body: "text" });

const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

export default BlogPost;
