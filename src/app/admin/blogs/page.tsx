import { connectDB } from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PageActions } from "@/components/admin/PageActions";

export default async function AdminBlogsPage() {
  await connectDB();
  const posts = await BlogPost.find().sort({ updatedAt: -1 }).lean();

  const rows = posts.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    category: p.category || "—",
    status: p.status,
    publishedAt: p.publishedAt,
    updatedAt: p.updatedAt,
  }));

  return (
    <div>
      <PageActions createHref="/admin/blogs/new" createLabel="New Post" />
      <DataTable
        data={rows}
        keyField="id"
        rowHref={(row) => `/admin/blogs/${row.id}`}
        columns={[
          { key: "title", header: "Title" },
          { key: "slug", header: "Slug" },
          { key: "category", header: "Category" },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.status as string} />,
          },
          {
            key: "publishedAt",
            header: "Published",
            render: (row) =>
              row.publishedAt
                ? new Date(row.publishedAt as string | Date).toLocaleDateString()
                : "—",
          },
        ]}
      />
    </div>
  );
}
