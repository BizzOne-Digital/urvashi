import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { serializeDocs, serialize } from "@/lib/serialize";
import { revalidateBlog, revalidateBlogPost } from "@/lib/revalidation";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  await connectDB();
  const posts = await BlogPost.find().sort({ updatedAt: -1 }).lean();
  return NextResponse.json(serializeDocs(posts));
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  try {
    await connectDB();
    const body = await request.json();
    if (!body.title || !body.body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    const slug = body.slug || slugify(body.title);
    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "Blog post with this slug already exists" }, { status: 400 });
    }

    const post = await BlogPost.create({
      title: body.title,
      slug,
      excerpt: body.excerpt,
      coverImage: body.coverImage,
      authorName: body.authorName,
      category: body.category,
      tags: body.tags || [],
      body: body.body,
      inlineImages: body.inlineImages || [],
      status: body.status || "draft",
      isDemo: body.isDemo ?? false,
      publishedAt: body.status === "published" ? body.publishedAt || new Date() : undefined,
      seo: body.seo || {},
    });

    revalidateBlog();
    return NextResponse.json(serialize(post.toObject()), { status: 201 });
  } catch (error) {
    console.error("Blog create error:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
