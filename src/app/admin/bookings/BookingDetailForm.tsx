"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface BookingData {
  _id: string;
  requestNumber: string;
  customer: { firstName: string; lastName: string; email: string; phone?: string };
  requestType: string;
  preferredDate?: string;
  preferredTimeWindow?: string;
  productInterest?: string;
  approximateQuantity?: number;
  message?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

export function BookingDetailForm({ initialData }: { initialData: BookingData }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      status: initialData.status,
      adminNotes: initialData.adminNotes || "",
      statusNote: "",
    },
  });

  const onSubmit = async (data: Record<string, string>) => {
    await adminFetch(`/api/admin/bookings/${initialData._id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      successMessage: "Booking updated",
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
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="font-medium">{initialData.customer.firstName} {initialData.customer.lastName}</p>
            <p className="text-chrome-mid">{initialData.customer.email}</p>
            {initialData.customer.phone && <p className="text-chrome-mid">{initialData.customer.phone}</p>}
          </div>
          <div className="text-chrome-mid">
            <p>Type: {initialData.requestType}</p>
            {initialData.preferredDate && <p>Preferred: {new Date(initialData.preferredDate).toLocaleDateString()}</p>}
            {initialData.preferredTimeWindow && <p>Time: {initialData.preferredTimeWindow}</p>}
            {initialData.productInterest && <p>Product: {initialData.productInterest}</p>}
          </div>
        </div>
        {initialData.message && (
          <div className="mt-4 rounded-md bg-carbon/5 p-4 text-sm">
            <p className="font-medium">Message</p>
            <p className="whitespace-pre-wrap">{initialData.message}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Status">
            <select className={selectClass} {...register("status")}>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="proposed">Proposed</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="declined">Declined</option>
              <option value="spam">Spam</option>
            </select>
          </FormField>
          <FormField label="Status Note">
            <input className={inputClass} {...register("statusNote")} />
          </FormField>
          <FormField label="Admin Notes" className="sm:col-span-2">
            <textarea className={textareaClass} rows={3} {...register("adminNotes")} />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/bookings")}>Back</Button>
        <Button type="submit" disabled={isSubmitting}>Save Changes</Button>
      </div>
    </form>
  );
}
