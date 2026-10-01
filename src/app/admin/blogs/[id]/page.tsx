import { connectDB } from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { serialize } from "@/lib/serialize";
import { notFound } from "next/navigation";
import { BlogForm } from "../BlogForm";

type Params = { params: Promise<{ id: string }> };

export default async function AdminBlogEditPage({ params }: Params) {
  const { id } = await params;

  if (id === "new") {
    return <BlogForm postId="new" />;
  }

  await connectDB();
  const post = await BlogPost.findById(id).lean();
  if (!post) notFound();

  const data = serialize(post);
  return (
    <BlogForm
      postId={id}
      initialData={{
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        authorName: data.authorName,
        category: data.category,
        tags: (data.tags || []).join(", "),
        body: data.body,
        status: data.status,
        seoTitle: data.seo?.title,
        seoDescription: data.seo?.description,
      }}
    />
  );
}
