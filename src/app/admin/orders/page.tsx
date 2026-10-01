import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOrdersPage() {
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 }).lean();

  const rows = orders.map((o) => ({
    id: o._id.toString(),
    orderNumber: o.orderNumber,
    customer: `${o.customer.firstName} ${o.customer.lastName}`,
    email: o.customer.email,
    total: o.total,
    currency: o.currency,
    paymentStatus: o.paymentStatus,
    productionStatus: o.productionStatus,
    createdAt: o.createdAt,
  }));

  return (
    <DataTable
      data={rows}
      keyField="id"
      rowHref={(row) => `/admin/orders/${row.id}`}
      columns={[
        { key: "orderNumber", header: "Order #" },
        { key: "customer", header: "Customer" },
        { key: "email", header: "Email" },
        {
          key: "total",
          header: "Total",
          render: (row) => formatCurrency(row.total as number, row.currency as string),
        },
        {
          key: "paymentStatus",
          header: "Payment",
          render: (row) => <StatusBadge status={row.paymentStatus as string} />,
        },
        {
          key: "productionStatus",
          header: "Production",
          render: (row) => <StatusBadge status={row.productionStatus as string} />,
        },
        {
          key: "createdAt",
          header: "Date",
          render: (row) => new Date(row.createdAt as string | Date).toLocaleDateString(),
        },
      ]}
    />
  );
}
