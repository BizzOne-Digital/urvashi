"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency } from "@/lib/utils";

interface OrderData {
  _id: string;
  orderNumber: string;
  customer: { email: string; firstName: string; lastName: string; phone?: string };
  items: Array<{ productName: string; quantity: number; unitPrice: number; lineTotal: number }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: string;
  productionStatus: string;
  fulfillmentStatus: string;
  adminNotes?: string;
  customerNotes?: string;
  statusHistory: Array<{ status: string; note?: string; changedAt: string }>;
  createdAt: string;
}

export function OrderDetailForm({ initialData }: { initialData: OrderData }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      paymentStatus: initialData.paymentStatus,
      productionStatus: initialData.productionStatus,
      fulfillmentStatus: initialData.fulfillmentStatus,
      adminNotes: initialData.adminNotes || "",
      statusNote: "",
    },
  });

  const onSubmit = async (data: Record<string, string>) => {
    await adminFetch(`/api/admin/orders/${initialData._id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      successMessage: "Order updated",
    });
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{initialData.orderNumber}</h2>
            <p className="text-sm text-chrome-mid">
              {new Date(initialData.createdAt).toLocaleString()}
            </p>
          </div>
          <StatusBadge status={initialData.paymentStatus} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold">Customer</h3>
            <p>{initialData.customer.firstName} {initialData.customer.lastName}</p>
            <p className="text-sm text-chrome-mid">{initialData.customer.email}</p>
            {initialData.customer.phone && (
              <p className="text-sm text-chrome-mid">{initialData.customer.phone}</p>
            )}
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Totals</h3>
            <p>Subtotal: {formatCurrency(initialData.subtotal, initialData.currency)}</p>
            <p>Tax: {formatCurrency(initialData.tax, initialData.currency)}</p>
            <p>Shipping: {formatCurrency(initialData.shippingCost, initialData.currency)}</p>
            <p className="font-bold">Total: {formatCurrency(initialData.total, initialData.currency)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Line Items</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2">Product</th>
              <th className="pb-2">Qty</th>
              <th className="pb-2">Unit</th>
              <th className="pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {initialData.items.map((item, i) => (
              <tr key={i} className="border-b border-chrome-light/10">
                <td className="py-2">{item.productName}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">{formatCurrency(item.unitPrice, initialData.currency)}</td>
                <td className="py-2">{formatCurrency(item.lineTotal, initialData.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Update Status</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Payment Status">
            <select className={selectClass} {...register("paymentStatus")}>
              <option value="awaiting_payment">Awaiting Payment</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </FormField>
          <FormField label="Production Status">
            <input className={inputClass} {...register("productionStatus")} />
          </FormField>
          <FormField label="Fulfillment Status">
            <input className={inputClass} {...register("fulfillmentStatus")} />
          </FormField>
          <FormField label="Status Note">
            <input className={inputClass} {...register("statusNote")} placeholder="Optional note for history" />
          </FormField>
          <FormField label="Admin Notes" className="sm:col-span-2">
            <textarea className={textareaClass} rows={3} {...register("adminNotes")} />
          </FormField>
        </div>
      </div>

      {initialData.statusHistory?.length > 0 && (
        <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Status History</h3>
          <div className="space-y-2">
            {initialData.statusHistory.map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <StatusBadge status={h.status} />
                <span className="text-chrome-mid">{new Date(h.changedAt).toLocaleString()}</span>
                {h.note && <span>{h.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/orders")}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
