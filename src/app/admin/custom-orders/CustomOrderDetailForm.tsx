"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface CustomOrderData {
  _id: string;
  requestNumber: string;
  customer: { email: string; firstName: string; lastName: string; phone?: string };
  productInterest?: string;
  quantity?: number;
  deadline?: string;
  instructions?: string;
  status: string;
  quoteAmount?: number;
  quoteCurrency?: string;
  quoteNotes?: string;
  adminNotes?: string;
  source: string;
  statusHistory: Array<{ status: string; note?: string; changedAt: string }>;
  createdAt: string;
}

export function CustomOrderDetailForm({ initialData }: { initialData: CustomOrderData }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      status: initialData.status,
      quoteAmount: initialData.quoteAmount ?? "",
      quoteCurrency: initialData.quoteCurrency || "CAD",
      quoteNotes: initialData.quoteNotes || "",
      adminNotes: initialData.adminNotes || "",
      statusNote: "",
    },
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    await adminFetch(`/api/admin/custom-orders/${initialData._id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      successMessage: "Custom order updated",
    });
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{initialData.requestNumber}</h2>
          <StatusBadge status={initialData.status} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-medium">{initialData.customer.firstName} {initialData.customer.lastName}</p>
            <p className="text-sm text-chrome-mid">{initialData.customer.email}</p>
          </div>
          <div className="text-sm text-chrome-mid">
            <p>Source: {initialData.source}</p>
            <p>Created: {new Date(initialData.createdAt).toLocaleString()}</p>
          </div>
        </div>
        {initialData.instructions && (
          <div className="mt-4 rounded-md bg-carbon/5 p-4 text-sm">
            <p className="font-medium">Instructions</p>
            <p className="whitespace-pre-wrap">{initialData.instructions}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Manage Request</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Status">
            <select className={selectClass} {...register("status")}>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="needs-info">Needs Info</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="converted-to-order">Converted to Order</option>
              <option value="declined">Declined</option>
              <option value="closed">Closed</option>
              <option value="spam">Spam</option>
            </select>
          </FormField>
          <FormField label="Status Note">
            <input className={inputClass} {...register("statusNote")} />
          </FormField>
          <FormField label="Quote Amount">
            <input type="number" step="0.01" className={inputClass} {...register("quoteAmount")} />
          </FormField>
          <FormField label="Quote Currency">
            <input className={inputClass} {...register("quoteCurrency")} />
          </FormField>
          <FormField label="Quote Notes" className="sm:col-span-2">
            <textarea className={textareaClass} rows={3} {...register("quoteNotes")} />
          </FormField>
          <FormField label="Admin Notes" className="sm:col-span-2">
            <textarea className={textareaClass} rows={3} {...register("adminNotes")} />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/custom-orders")}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>Save Changes</Button>
      </div>
    </form>
  );
}
