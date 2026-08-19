"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, textareaClass, selectClass } from "@/components/admin/FormField";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface MessageData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  inquiryType: string;
  productInterest?: string;
  serviceInterest?: string;
  quantity?: number;
  message: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

export function MessageDetailForm({ initialData }: { initialData: MessageData }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      status: initialData.status,
      adminNotes: initialData.adminNotes || "",
    },
  });

  const onSubmit = async (data: Record<string, string>) => {
    await adminFetch(`/api/admin/messages/${initialData._id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      successMessage: "Message updated",
    });
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {initialData.firstName} {initialData.lastName}
          </h2>
          <StatusBadge status={initialData.status} />
        </div>
        <div className="grid gap-2 text-sm text-chrome-mid">
          <p>{initialData.email}</p>
          {initialData.phone && <p>{initialData.phone}</p>}
          <p>Type: {initialData.inquiryType}</p>
          {initialData.productInterest && <p>Product: {initialData.productInterest}</p>}
          {initialData.serviceInterest && <p>Service: {initialData.serviceInterest}</p>}
          <p>Received: {new Date(initialData.createdAt).toLocaleString()}</p>
        </div>
        <div className="mt-4 rounded-md bg-carbon/5 p-4">
          <p className="whitespace-pre-wrap text-sm">{initialData.message}</p>
        </div>
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Status">
            <select className={selectClass} {...register("status")}>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
              <option value="spam">Spam</option>
            </select>
          </FormField>
          <FormField label="Admin Notes" className="sm:col-span-2">
            <textarea className={textareaClass} rows={3} {...register("adminNotes")} />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/messages")}>Back</Button>
        <Button type="submit" disabled={isSubmitting}>Save Changes</Button>
      </div>
    </form>
  );
}
