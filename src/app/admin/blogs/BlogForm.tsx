"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
import { slugify } from "@/lib/utils";

const blogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  authorName: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  body: z.string().min(1),
  status: z.enum(["draft", "published", "archived"]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

export function BlogForm({ postId, initialData }: { postId?: string; initialData?: Partial<BlogFormData> }) {
  const router = useRouter();
  const isNew = !postId || postId === "new";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      coverImage: initialData?.coverImage || "",
      authorName: initialData?.authorName || "",
      category: initialData?.category || "",
      tags: initialData?.tags || "",
      body: initialData?.body || "",
      status: (initialData?.status as BlogFormData["status"]) || "draft",
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
    },
  });

  const onSubmit = async (data: BlogFormData) => {
    const payload = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      authorName: data.authorName,
      category: data.category,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      body: data.body,
      status: data.status,
      seo: { title: data.seoTitle, description: data.seoDescription },
    };

    if (isNew) {
      const created = await adminFetch<{ _id: string }>("/api/admin/blogs", {
        method: "POST",
        body: JSON.stringify(payload),
        successMessage: "Blog post created",
      });
      router.push(`/admin/blogs/${created._id}`);
    } else {
      await adminFetch(`/api/admin/blogs/${postId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        successMessage: "Blog post saved",
      });
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" error={errors.title?.message}>
            <input
              className={inputClass}
              {...register("title")}
              onChange={(e) => {
                setValue("title", e.target.value);
                if (isNew) setValue("slug", slugify(e.target.value));
              }}
            />
          </FormField>
          <FormField label="Slug" error={errors.slug?.message}>
            <input className={inputClass} {...register("slug")} />
          </FormField>
          <FormField label="Status">
            <select className={selectClass} {...register("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>
          <FormField label="Author">
            <input className={inputClass} {...register("authorName")} />
          </FormField>
          <FormField label="Category">
            <input className={inputClass} {...register("category")} />
          </FormField>
          <FormField label="Tags (comma-separated)">
            <input className={inputClass} {...register("tags")} />
          </FormField>
          <FormField label="Cover Image URL" className="sm:col-span-2">
            <input className={inputClass} {...register("coverImage")} />
          </FormField>
          <FormField label="Excerpt" className="sm:col-span-2">
            <textarea className={textareaClass} rows={2} {...register("excerpt")} />
          </FormField>
          <FormField label="Body" error={errors.body?.message} className="sm:col-span-2">
            <textarea className={textareaClass} rows={12} {...register("body")} />
          </FormField>
          <FormField label="SEO Title">
            <input className={inputClass} {...register("seoTitle")} />
          </FormField>
          <FormField label="SEO Description">
            <input className={inputClass} {...register("seoDescription")} />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/blogs")}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isNew ? "Create Post" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
