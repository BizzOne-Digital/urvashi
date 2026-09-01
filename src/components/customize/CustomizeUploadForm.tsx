"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone number is required"),
  message: z.string().max(2000).optional(),
  consentGiven: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CustomizeUploadFormProps {
  rightsConfirmationCopy?: string;
  className?: string;
}

export function CustomizeUploadForm({
  rightsConfirmationCopy = "I confirm that I have the right to use this artwork for printing purposes.",
  className,
}: CustomizeUploadFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fieldClass =
    "w-full rounded-sm border border-white/15 bg-[#12141c] px-4 py-3 text-sm text-pure-paper placeholder:text-chrome-mid focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/25";

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const onSubmit = async (data: FormData) => {
    if (!file) {
      toast.error("Please upload your picture or artwork");
      return;
    }

    setSubmitting(true);
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("rightsConfirmed", "true");
      if (data.message) formData.append("customerNote", data.message);

      const uploadRes = await fetch("/api/upload/artwork", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error || "Upload failed");
      setUploading(false);

      const artworkId = uploadJson.artwork?.id || uploadJson.artwork?._id;
      if (!artworkId) throw new Error("Upload did not return artwork id");

      const res = await fetch("/api/customize-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          message: data.message,
          artworkAssetId: artworkId,
          consentGiven: true,
          website: data.website,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit request");

      toast.success(json.message || "Your request was sent successfully");
      reset();
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

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
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-pure-paper">Phone</label>
          <input id="phone" type="tel" {...register("phone")} className={fieldClass} />
          {errors.phone && <p className="mt-1 text-xs text-deep-magenta">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-pure-paper">
          What would you like printed? (optional)
        </label>
        <textarea id="message" rows={3} {...register("message")} className={fieldClass} placeholder="Product type, quantity, colours, or any notes…" />
      </div>

      <div>
        <label htmlFor="artwork" className="mb-2 block text-sm font-medium text-pure-paper">
          Upload your picture / artwork
        </label>
        <input
          id="artwork"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={onFileChange}
          className="block w-full text-sm text-chrome-light file:mr-3 file:rounded-sm file:border-0 file:bg-cyan/20 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-cyan hover:file:bg-cyan/30"
        />
        {previewUrl && (
          <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-[#0a0c14]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Your upload preview" className="mx-auto max-h-64 w-full object-contain p-4" />
          </div>
        )}
        {!file && <p className="mt-1 text-xs text-chrome-mid">PNG, JPEG, WebP, or PDF — max 25MB</p>}
      </div>

      <label className="flex items-start gap-3 text-sm text-chrome-light">
        <input type="checkbox" value="true" {...register("consentGiven")} className="mt-1 accent-cyan" />
        <span>{rightsConfirmationCopy}</span>
      </label>
      {errors.consentGiven && <p className="text-xs text-deep-magenta">{errors.consentGiven.message}</p>}

      <Button type="submit" disabled={submitting || uploading} className="w-full sm:w-auto">
        {submitting || uploading ? "Sending…" : "Submit request"}
      </Button>
    </form>
  );
}
