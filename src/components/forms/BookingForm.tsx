"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  requestType: z.string().min(1, "Please select a consultation type"),
  preferredDate: z.string().optional(),
  preferredTimeWindow: z.string().optional(),
  timezone: z.string().optional(),
  flexibility: z.string().optional(),
  productInterest: z.string().optional(),
  approximateQuantity: z.coerce.number().int().positive().optional().or(z.literal("")),
  eventDate: z.string().optional(),
  message: z.string().optional(),
  consentGiven: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
  website: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  methods?: string[];
  className?: string;
}

export function BookingForm({ methods = [], className }: BookingFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      requestType: methods[0] || "Phone call",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
          },
          requestType: data.requestType,
          preferredDate: data.preferredDate,
          preferredTimeWindow: data.preferredTimeWindow,
          timezone: data.timezone,
          flexibility: data.flexibility,
          productInterest: data.productInterest,
          approximateQuantity: data.approximateQuantity === "" ? undefined : data.approximateQuantity,
          eventDate: data.eventDate,
          message: data.message,
          consentGiven: data.consentGiven,
          website: data.website,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit request");
      toast.success(json.message || "Consultation request received");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-sm border border-white/15 bg-[#12141c] px-4 py-3 text-sm text-pure-paper placeholder:text-chrome-mid focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/25";
  const selectClass = cn(fieldClass, "[&>option]:bg-ink-black [&>option]:text-pure-paper");
  const requestTypes = methods.length > 0 ? methods : ["Phone call", "WhatsApp consultation", "Video call", "Design review", "Large/custom order", "Other"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-5", className)} noValidate>
      <input type="text" {...register("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-pure-paper">First name</label>
          <input id="firstName" {...register("firstName")} className={fieldClass} />
          {errors.firstName && <p className="mt-1 text-xs text-deep-magenta">{errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-pure-paper">Last name</label>
          <input id="lastName" {...register("lastName")} className={fieldClass} />
          {errors.lastName && <p className="mt-1 text-xs text-deep-magenta">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-pure-paper">Email</label>
          <input id="email" type="email" {...register("email")} className={fieldClass} />
          {errors.email && <p className="mt-1 text-xs text-deep-magenta">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-pure-paper">Phone (optional)</label>
          <input id="phone" type="tel" {...register("phone")} className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="requestType" className="mb-1 block text-sm font-medium text-pure-paper">Consultation type</label>
        <select id="requestType" {...register("requestType")} className={selectClass}>
          {requestTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.requestType && <p className="mt-1 text-xs text-deep-magenta">{errors.requestType.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="preferredDate" className="mb-1 block text-sm font-medium text-pure-paper">Preferred date</label>
          <input id="preferredDate" type="date" {...register("preferredDate")} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="preferredTimeWindow" className="mb-1 block text-sm font-medium text-pure-paper">Time window</label>
          <input id="preferredTimeWindow" placeholder="e.g. Morning" {...register("preferredTimeWindow")} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="timezone" className="mb-1 block text-sm font-medium text-pure-paper">Timezone</label>
          <input id="timezone" {...register("timezone")} className={fieldClass} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="productInterest" className="mb-1 block text-sm font-medium text-pure-paper">Product interest</label>
          <input id="productInterest" {...register("productInterest")} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="approximateQuantity" className="mb-1 block text-sm font-medium text-pure-paper">Approximate quantity</label>
          <input id="approximateQuantity" type="number" min={1} {...register("approximateQuantity")} className={fieldClass} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="eventDate" className="mb-1 block text-sm font-medium text-pure-paper">Event date (optional)</label>
          <input id="eventDate" type="date" {...register("eventDate")} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="flexibility" className="mb-1 block text-sm font-medium text-pure-paper">Schedule flexibility</label>
          <input id="flexibility" placeholder="e.g. Weekdays only" {...register("flexibility")} className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-pure-paper">Additional details</label>
        <textarea id="message" rows={4} {...register("message")} className={fieldClass} />
      </div>

      <label className="flex items-start gap-3 text-sm text-chrome-light">
        <input type="checkbox" value="true" {...register("consentGiven")} className="mt-1 accent-cyan" />
        <span>I understand this is a consultation request, not a confirmed appointment.</span>
      </label>
      {errors.consentGiven && <p className="text-xs text-deep-magenta">{errors.consentGiven.message}</p>}

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Submitting…" : "Request consultation"}
      </Button>
    </form>
  );
}
