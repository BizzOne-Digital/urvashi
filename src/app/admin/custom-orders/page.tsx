import { connectDB } from "@/lib/db";
import CustomOrderRequest from "@/models/CustomOrderRequest";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminCustomOrdersPage() {
  await connectDB();
  const requests = await CustomOrderRequest.find().sort({ createdAt: -1 }).lean();

  const rows = requests.map((r) => ({
    id: r._id.toString(),
    requestNumber: r.requestNumber,
    customer: `${r.customer.firstName} ${r.customer.lastName}`,
    productInterest: r.productInterest || "—",
    status: r.status,
    source: r.source,
    createdAt: r.createdAt,
  }));

  return (
    <DataTable
      data={rows}
      keyField="id"
      rowHref={(row) => `/admin/custom-orders/${row.id}`}
      columns={[
        { key: "requestNumber", header: "Request #" },
        { key: "customer", header: "Customer" },
        { key: "productInterest", header: "Product" },
        {
          key: "status",
          header: "Status",
          render: (row) => <StatusBadge status={row.status as string} />,
        },
        { key: "source", header: "Source" },
        {
          key: "createdAt",
          header: "Date",
          render: (row) => new Date(row.createdAt as string | Date).toLocaleDateString(),
        },
      ]}
    />
  );
}
