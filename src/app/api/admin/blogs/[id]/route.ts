import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { serialize } from "@/lib/serialize";
import { revalidateBlog, revalidateBlogPost } from "@/lib/revalidation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { id } = await params;
  await connectDB();
  const post = await BlogPost.findById(id).lean();
  if (!post) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }
  return NextResponse.json(serialize(post));
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { id } = await params;
  try {
    await connectDB();
    const body = await request.json();

    if (body.status === "published" && !body.publishedAt) {
      const existing = await BlogPost.findById(id);
      if (existing && !existing.publishedAt) {
        body.publishedAt = new Date();
      }
    }

    const post = await BlogPost.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    revalidateBlogPost(post.slug);
    return NextResponse.json(serialize(post.toObject()));
  } catch (error) {
    console.error("Blog update error:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const { id } = await params;
  try {
    await connectDB();
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    revalidateBlog();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blog delete error:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
