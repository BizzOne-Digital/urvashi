import { connectDB } from "@/lib/db";
import BookingRequest from "@/models/BookingRequest";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminBookingsPage() {
  await connectDB();
  const bookings = await BookingRequest.find().sort({ createdAt: -1 }).lean();

  const rows = bookings.map((b) => ({
    id: b._id.toString(),
    requestNumber: b.requestNumber,
    customer: `${b.customer.firstName} ${b.customer.lastName}`,
    requestType: b.requestType,
    preferredDate: b.preferredDate,
    status: b.status,
    createdAt: b.createdAt,
  }));

  return (
    <DataTable
      data={rows}
      keyField="id"
      rowHref={(row) => `/admin/bookings/${row.id}`}
      columns={[
        { key: "requestNumber", header: "Request #" },
        { key: "customer", header: "Customer" },
        { key: "requestType", header: "Type" },
        {
          key: "preferredDate",
          header: "Preferred Date",
          render: (row) =>
            row.preferredDate ? new Date(row.preferredDate as string | Date).toLocaleDateString() : "—",
        },
        {
          key: "status",
          header: "Status",
          render: (row) => <StatusBadge status={row.status as string} />,
        },
        {
          key: "createdAt",
          header: "Submitted",
          render: (row) => new Date(row.createdAt as string | Date).toLocaleDateString(),
        },
      ]}
    />
  );
}
