import { connectDB } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminMessagesPage() {
  await connectDB();
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();

  const rows = messages.map((m) => ({
    id: m._id.toString(),
    name: `${m.firstName} ${m.lastName}`,
    email: m.email,
    inquiryType: m.inquiryType,
    status: m.status,
    createdAt: m.createdAt,
  }));

  return (
    <DataTable
      data={rows}
      keyField="id"
      rowHref={(row) => `/admin/messages/${row.id}`}
      columns={[
        { key: "name", header: "From" },
        { key: "email", header: "Email" },
        { key: "inquiryType", header: "Type" },
        {
          key: "status",
          header: "Status",
          render: (row) => <StatusBadge status={row.status as string} />,
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
