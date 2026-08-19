import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PageActions } from "@/components/admin/PageActions";

export default async function AdminServicesPage() {
  await connectDB();
  const services = await Service.find().sort({ order: 1 }).lean();

  const rows = services.map((s) => ({
    id: s._id.toString(),
    title: s.title,
    slug: s.slug,
    order: s.order,
    status: s.status,
    updatedAt: s.updatedAt,
  }));

  return (
    <div>
      <PageActions createHref="/admin/services/new" createLabel="Add Service" />
      <DataTable
        data={rows}
        keyField="id"
        rowHref={(row) => `/admin/services/${row.id}`}
        columns={[
          { key: "title", header: "Service" },
          { key: "slug", header: "Slug" },
          { key: "order", header: "Order" },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.status as string} />,
          },
          {
            key: "updatedAt",
            header: "Updated",
            render: (row) => new Date(row.updatedAt as string | Date).toLocaleDateString(),
          },
        ]}
      />
    </div>
  );
}
