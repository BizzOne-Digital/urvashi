"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { MonerisCheckout } from "@/components/payments/MonerisCheckout";
import {
  ArtworkMultiUpload,
  clearArtworkItems,
  getUploadedArtworkIds,
  type LocalArtworkFile,
  uploadArtworkItemsOnSubmit,
  uploadPendingArtworkItems,
} from "@/components/customize/ArtworkMultiUpload";
import { cn, formatCurrency } from "@/lib/utils";

type MonerisEnvironment = "qa" | "prod";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone number is required"),
  message: z.string().max(2000).optional(),
  preferDesign: z.boolean(),
  consentGiven: z
    .boolean()
    .refine((value) => value === true, { message: "Consent is required" }),
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CustomizeUploadFormProps {
  baseFee?: number;
  designFee?: number;
  monerisMode?: MonerisEnvironment;
  rightsConfirmationCopy?: string;
  className?: string;
}

interface PendingMonerisPayment {
  ticket: string;
  referenceNumber: string;
  mode: MonerisEnvironment;
}

export function CustomizeUploadForm({
  baseFee = 19,
  designFee = 5,
  monerisMode = "qa",
  rightsConfirmationCopy = "I confirm that I have the right to use this artwork for printing purposes.",
  className,
}: CustomizeUploadFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [artworkItems, setArtworkItems] = useState<LocalArtworkFile[]>([]);
  const [pendingPayment, setPendingPayment] = useState<PendingMonerisPayment | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferDesign: false, consentGiven: false },
  });

  const preferDesign = watch("preferDesign");
  const consentGiven = watch("consentGiven");
  const message = watch("message");
  const totalToday = baseFee + (preferDesign ? designFee : 0);

  const fieldClass =
    "w-full rounded-sm border border-white/15 bg-[#12141c] px-4 py-3 text-sm text-pure-paper placeholder:text-chrome-mid focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/25";

  const onSubmit = async (data: FormData) => {
    if (!artworkItems.length) {
      toast.error("Please upload at least one picture or artwork file");
      return;
    }

    if (data.preferDesign && !data.message?.trim()) {
      toast.error("Please describe what you want in your design");
      return;
    }

    setSubmitting(true);
    try {
      setUploading(true);
      const { artworkIds } = await uploadArtworkItemsOnSubmit(
        artworkItems,
        data.consentGiven,
        data.message
      );
      setUploading(false);

      const res = await fetch("/api/customize/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          message: data.message,
          artworkAssetIds: artworkIds,
          preferDesign: data.preferDesign,
          consentGiven: true,
          website: data.website,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit request");

      if (json.requiresPayment && json.monerisTicket) {
        setPendingPayment({
          ticket: json.monerisTicket,
          referenceNumber: json.referenceNumber,
          mode: json.monerisMode === "prod" ? "prod" : monerisMode,
        });
        return;
      }

      toast.success(json.message || "Your request was sent successfully");
      reset();
      clearArtworkItems(artworkItems);
      setArtworkItems([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const handleMonerisComplete = async (ticket: string) => {
    if (!pendingPayment) return;

    try {
      const res = await fetch("/api/customize/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket,
          referenceNumber: pendingPayment.referenceNumber,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Payment confirmation failed");

      setPendingPayment(null);
      reset();
      clearArtworkItems(artworkItems);
      setArtworkItems([]);
      router.push(`/customize/success?ref=${pendingPayment.referenceNumber}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment confirmation failed");
    }
  };

  const handleConsentChange = async (checked: boolean) => {
    setValue("consentGiven", checked, { shouldValidate: true });
    if (!checked || !artworkItems.length) return;

    setUploading(true);
    try {
      const uploaded = await uploadPendingArtworkItems(artworkItems, message);
      setArtworkItems(uploaded);
      if (getUploadedArtworkIds(uploaded).length) {
        toast.success("Artwork uploaded");
      }
    } finally {
      setUploading(false);
    }
  };

  const submitLabel = submitting || uploading ? "Processing…" : `Pay ${formatCurrency(totalToday)} now`;

  return (
    <>
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
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-pure-paper">Phone</label>
          <input id="phone" type="tel" {...register("phone")} className={fieldClass} />
          {errors.phone && <p className="mt-1 text-xs text-deep-magenta">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-pure-paper">
          What would you like printed? {preferDesign ? "(required)" : "(optional)"}
        </label>
        <textarea
          id="message"
          rows={3}
          {...register("message")}
          className={fieldClass}
          placeholder={
            preferDesign
              ? "Describe colours, product type, text, or style you want in your design…"
              : "Product type, quantity, colours, collage layout, or any notes…"
          }
        />
      </div>

      <ArtworkMultiUpload
        items={artworkItems}
        onChange={setArtworkItems}
        rightsConfirmed={consentGiven}
        customerNote={message}
      />

      <div className="rounded-lg border border-cyan/25 bg-cyan/5 p-4">
        <label className="flex items-start gap-3 text-sm text-pure-paper">
          <input type="checkbox" {...register("preferDesign")} className="mt-1 accent-cyan" />
          <span>
            <strong>I prefer your design</strong> — our team will create 2–3 design options based on your upload
            <span className="text-cyan"> (+{formatCurrency(designFee)})</span>
          </span>
        </label>
        <p className="mt-2 text-xs text-chrome-mid">
          {preferDesign
            ? "Pay now through Moneris. After payment we email you a confirmation and send your requirements + images to our team."
            : "Pay the customization fee now with your own upload. We will contact you about printing after payment."}
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-chrome-light">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => handleConsentChange(e.target.checked)}
          className="mt-1 accent-cyan"
        />
        <span>{rightsConfirmationCopy}</span>
      </label>
      {errors.consentGiven && <p className="text-xs text-deep-magenta">{errors.consentGiven.message}</p>}

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-pure-paper">
        <p className="flex justify-between">
          <span>Customization fee</span>
          <span>{formatCurrency(baseFee)}</span>
        </p>
        {preferDesign && (
          <p className="mt-2 flex justify-between text-cyan">
            <span>Design service add-on</span>
            <span>+{formatCurrency(designFee)}</span>
          </p>
        )}
        <p className="mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold">
          <span>Total today</span>
          <span className="text-cyan">{formatCurrency(totalToday)} CAD</span>
        </p>
      </div>

      <Button type="submit" disabled={submitting || uploading} className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>

      {pendingPayment && (
        <MonerisCheckout
          ticket={pendingPayment.ticket}
          mode={pendingPayment.mode}
          onComplete={handleMonerisComplete}
          onCancel={() => {
            setPendingPayment(null);
            toast.message("Payment cancelled. You can submit again when ready.");
          }}
          onError={(message) => toast.error(message)}
        />
      )}
    </>
  );
}
