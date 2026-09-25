import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PageActions } from "@/components/admin/PageActions";
import { formatCurrency } from "@/lib/utils";

export default async function AdminProductsPage() {
  await connectDB();
  const products = await Product.find().sort({ updatedAt: -1 }).lean();

  const rows = products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    sku: p.sku,
    price: p.price,
    currency: p.currency,
    status: p.status,
    availability: p.availability,
    updatedAt: p.updatedAt,
  }));

  return (
    <div>
      <PageActions createHref="/admin/products/new" createLabel="Add Product" />

      <DataTable
        data={rows}
        keyField="id"
        rowHref={(row) => `/admin/products/${row.id}`}
        columns={[
          { key: "name", header: "Product" },
          { key: "sku", header: "SKU" },
          {
            key: "price",
            header: "Price",
            render: (row) =>
              row.price != null ? formatCurrency(row.price as number, row.currency as string) : "Quote",
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.status as string} />,
          },
          {
            key: "availability",
            header: "Availability",
            render: (row) => <StatusBadge status={row.availability as string} />,
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
