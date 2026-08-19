"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  inquiryType: z.string().min(1, "Please select an inquiry type"),
  productInterest: z.string().optional(),
  serviceInterest: z.string().optional(),
  quantity: z.coerce.number().int().positive().optional().or(z.literal("")),
  deadline: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  consentGiven: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
  website: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const INQUIRY_TYPES = [
  "General question",
  "Product inquiry",
  "Custom order",
  "Artwork help",
  "Pricing quote",
  "Order status",
  "Other",
];

interface ContactFormProps {
  className?: string;
}

export function ContactForm({ className }: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { inquiryType: "General question" },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          quantity: data.quantity === "" ? undefined : data.quantity,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send message");
      toast.success(json.message || "Message sent successfully");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = "w-full rounded-sm border border-chrome-light bg-pure-paper px-4 py-3 text-sm focus:border-royal-blue focus:outline-none focus:ring-1 focus:ring-royal-blue";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("min-w-0 space-y-5", className)} noValidate>
      <input type="text" {...register("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium">First name</label>
          <input id="firstName" {...register("firstName")} className={fieldClass} />
          {errors.firstName && <p className="mt-1 text-xs text-deep-magenta">{errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium">Last name</label>
          <input id="lastName" {...register("lastName")} className={fieldClass} />
          {errors.lastName && <p className="mt-1 text-xs text-deep-magenta">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" type="email" {...register("email")} className={fieldClass} />
          {errors.email && <p className="mt-1 text-xs text-deep-magenta">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone (optional)</label>
          <input id="phone" type="tel" {...register("phone")} className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="inquiryType" className="mb-1 block text-sm font-medium">Inquiry type</label>
        <select id="inquiryType" {...register("inquiryType")} className={fieldClass}>
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.inquiryType && <p className="mt-1 text-xs text-deep-magenta">{errors.inquiryType.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="productInterest" className="mb-1 block text-sm font-medium">Product interest (optional)</label>
          <input id="productInterest" {...register("productInterest")} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="serviceInterest" className="mb-1 block text-sm font-medium">Service interest (optional)</label>
          <input id="serviceInterest" {...register("serviceInterest")} className={fieldClass} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium">Approximate quantity (optional)</label>
          <input id="quantity" type="number" min={1} {...register("quantity")} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="deadline" className="mb-1 block text-sm font-medium">Deadline (optional)</label>
          <input id="deadline" type="date" {...register("deadline")} className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">Message</label>
        <textarea id="message" rows={5} {...register("message")} className={fieldClass} />
        {errors.message && <p className="mt-1 text-xs text-deep-magenta">{errors.message.message}</p>}
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" value="true" {...register("consentGiven")} className="mt-1" />
        <span>I consent to DPM Custom Prints contacting me about this inquiry.</span>
      </label>
      {errors.consentGiven && <p className="text-xs text-deep-magenta">{errors.consentGiven.message}</p>}

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
