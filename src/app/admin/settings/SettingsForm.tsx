"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

interface SettingsData {
  general: Record<string, unknown>;
  brand: Record<string, unknown>;
  contact: Record<string, unknown>;
  social: Array<Record<string, unknown>>;
  commerce: Record<string, unknown>;
  customization: Record<string, unknown>;
  booking: Record<string, unknown>;
  footer: Record<string, unknown>;
  motion: Record<string, unknown>;
}

const tabs = [
  { id: "general", label: "General" },
  { id: "contact", label: "Contact" },
  { id: "social", label: "Social" },
  { id: "commerce", label: "Commerce" },
  { id: "customization", label: "Customization" },
  { id: "booking", label: "Booking" },
  { id: "footer", label: "Footer" },
  { id: "motion", label: "Motion" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function SettingsForm({ initialData }: { initialData: SettingsData }) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [settings, setSettings] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const updateField = (group: string, field: string, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [group]: { ...(prev[group as keyof SettingsData] as Record<string, unknown>), [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
        successMessage: "Settings saved",
      });
    } finally {
      setSaving(false);
    }
  };

  const general = settings.general as Record<string, string | boolean | undefined>;
  const contact = settings.contact as Record<string, string>;
  const commerce = settings.commerce as Record<string, string | number | boolean | string[]>;
  const customization = settings.customization as Record<string, string | number | string[]>;
  const booking = settings.booking as Record<string, string | string[]>;
  const footer = settings.footer as Record<string, string>;
  const motion = settings.motion as Record<string, string | boolean>;
  const social = settings.social || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 rounded-lg border border-chrome-light/20 bg-white p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-all",
              activeTab === tab.id ? "bg-royal-blue text-pure-paper" : "text-carbon hover:bg-carbon/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
        {activeTab === "general" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Business Name">
              <input className={inputClass} value={String(general.businessName || "")} onChange={(e) => updateField("general", "businessName", e.target.value)} />
            </FormField>
            <FormField label="Short Name">
              <input className={inputClass} value={String(general.shortName || "")} onChange={(e) => updateField("general", "shortName", e.target.value)} />
            </FormField>
            <FormField label="Tagline" className="sm:col-span-2">
              <input className={inputClass} value={String(general.tagline || "")} onChange={(e) => updateField("general", "tagline", e.target.value)} />
            </FormField>
            <FormField label="Announcement" className="sm:col-span-2">
              <input className={inputClass} value={(general.announcement as string) || ""} onChange={(e) => updateField("general", "announcement", e.target.value)} />
            </FormField>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!general.announcementEnabled} onChange={(e) => updateField("general", "announcementEnabled", e.target.checked)} />
              Show announcement bar
            </label>
            <FormField label="Currency">
              <input className={inputClass} value={String(general.currency || "CAD")} onChange={(e) => updateField("general", "currency", e.target.value)} />
            </FormField>
            <FormField label="Default SEO Title" className="sm:col-span-2">
              <input className={inputClass} value={(general.defaultSeoTitle as string) || ""} onChange={(e) => updateField("general", "defaultSeoTitle", e.target.value)} />
            </FormField>
            <FormField label="Default SEO Description" className="sm:col-span-2">
              <textarea className={textareaClass} rows={2} value={(general.defaultSeoDescription as string) || ""} onChange={(e) => updateField("general", "defaultSeoDescription", e.target.value)} />
            </FormField>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(["email", "phone", "phoneLink", "whatsappLink", "address", "businessHours"] as const).map((field) => (
              <FormField key={field} label={field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}>
                <input className={inputClass} value={contact[field] || ""} onChange={(e) => updateField("contact", field, e.target.value)} />
              </FormField>
            ))}
          </div>
        )}

        {activeTab === "social" && (
          <div className="space-y-4">
            {social.map((link, i) => (
              <div key={i} className="grid gap-4 rounded-md border p-4 sm:grid-cols-2">
                <FormField label="Platform">
                  <input className={inputClass} value={(link.platform as string) || ""} onChange={(e) => {
                    const updated = [...social];
                    updated[i] = { ...updated[i], platform: e.target.value };
                    setSettings((prev) => ({ ...prev, social: updated }));
                  }} />
                </FormField>
                <FormField label="URL">
                  <input className={inputClass} value={(link.url as string) || ""} onChange={(e) => {
                    const updated = [...social];
                    updated[i] = { ...updated[i], url: e.target.value };
                    setSettings((prev) => ({ ...prev, social: updated }));
                  }} />
                </FormField>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!link.isActive} onChange={(e) => {
                    const updated = [...social];
                    updated[i] = { ...updated[i], isActive: e.target.checked };
                    setSettings((prev) => ({ ...prev, social: updated }));
                  }} />
                  Active
                </label>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => setSettings((prev) => ({ ...prev, social: [...social, { platform: "", url: "", isActive: false }] }))}>
              Add Social Link
            </Button>
          </div>
        )}

        {activeTab === "commerce" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Tax Mode">
              <select className={selectClass} value={(commerce.taxMode as string) || "canadian"} onChange={(e) => updateField("commerce", "taxMode", e.target.value)}>
                <option value="canadian">Canadian (by province)</option>
                <option value="none">None</option>
                <option value="manual">Manual</option>
                <option value="configured">Configured flat rate</option>
              </select>
            </FormField>
            <FormField label="Tax Rate (%)">
              <input type="number" step="0.01" className={inputClass} value={(commerce.taxRate as number) || ""} onChange={(e) => updateField("commerce", "taxRate", Number(e.target.value))} />
            </FormField>
            <FormField label="Origin postal code (shipping from)">
              <input className={inputClass} value={(commerce.originPostalCode as string) || ""} onChange={(e) => updateField("commerce", "originPostalCode", e.target.value)} placeholder="K1A0B1" />
            </FormField>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!commerce.pickupEnabled} onChange={(e) => updateField("commerce", "pickupEnabled", e.target.checked)} />
              Pickup enabled
            </label>
            <FormField label="Order confirmation message" className="sm:col-span-2">
              <textarea className={textareaClass} rows={3} value={(commerce.orderConfirmationCopy as string) || ""} onChange={(e) => updateField("commerce", "orderConfirmationCopy", e.target.value)} />
            </FormField>
            <FormField label="Return Notes" className="sm:col-span-2">
              <textarea className={textareaClass} rows={2} value={(commerce.returnNotes as string) || ""} onChange={(e) => updateField("commerce", "returnNotes", e.target.value)} />
            </FormField>
          </div>
        )}

        {activeTab === "customization" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Max File Size (MB)">
              <input type="number" className={inputClass} value={(customization.maxFileSizeMB as number) || 25} onChange={(e) => updateField("customization", "maxFileSizeMB", Number(e.target.value))} />
            </FormField>
            <FormField label="Accepted File Types" className="sm:col-span-2">
              <input className={inputClass} value={((customization.acceptedFileTypes as string[]) || []).join(", ")} onChange={(e) => updateField("customization", "acceptedFileTypes", e.target.value.split(",").map((s) => s.trim()))} />
            </FormField>
            <FormField label="Rights Confirmation Copy" className="sm:col-span-2">
              <textarea className={textareaClass} rows={2} value={(customization.rightsConfirmationCopy as string) || ""} onChange={(e) => updateField("customization", "rightsConfirmationCopy", e.target.value)} />
            </FormField>
            <FormField label="Preview Disclaimer" className="sm:col-span-2">
              <textarea className={textareaClass} rows={2} value={(customization.previewDisclaimer as string) || ""} onChange={(e) => updateField("customization", "previewDisclaimer", e.target.value)} />
            </FormField>
          </div>
        )}

        {activeTab === "booking" && (
          <div className="grid gap-4">
            <FormField label="Available Methods (comma-separated)">
              <input className={inputClass} value={((booking.methods as string[]) || []).join(", ")} onChange={(e) => updateField("booking", "methods", e.target.value.split(",").map((s) => s.trim()))} />
            </FormField>
            <FormField label="Available Days (comma-separated)">
              <input className={inputClass} value={((booking.availableDays as string[]) || []).join(", ")} onChange={(e) => updateField("booking", "availableDays", e.target.value.split(",").map((s) => s.trim()))} />
            </FormField>
            <FormField label="Time Windows (comma-separated)">
              <input className={inputClass} value={((booking.availableTimeWindows as string[]) || []).join(", ")} onChange={(e) => updateField("booking", "availableTimeWindows", e.target.value.split(",").map((s) => s.trim()))} />
            </FormField>
            <FormField label="Confirmation Copy">
              <textarea className={textareaClass} rows={3} value={(booking.confirmationCopy as string) || ""} onChange={(e) => updateField("booking", "confirmationCopy", e.target.value)} />
            </FormField>
          </div>
        )}

        {activeTab === "footer" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Description" className="sm:col-span-2">
              <textarea className={textareaClass} rows={2} value={footer.description || ""} onChange={(e) => updateField("footer", "description", e.target.value)} />
            </FormField>
            <FormField label="CTA Text">
              <input className={inputClass} value={footer.ctaText || ""} onChange={(e) => updateField("footer", "ctaText", e.target.value)} />
            </FormField>
            <FormField label="CTA URL">
              <input className={inputClass} value={footer.ctaUrl || ""} onChange={(e) => updateField("footer", "ctaUrl", e.target.value)} />
            </FormField>
            <FormField label="Copyright" className="sm:col-span-2">
              <input className={inputClass} value={footer.copyright || ""} onChange={(e) => updateField("footer", "copyright", e.target.value)} />
            </FormField>
          </div>
        )}

        {activeTab === "motion" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!motion.introEnabled} onChange={(e) => updateField("motion", "introEnabled", e.target.checked)} />
              Intro animation enabled
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!motion.introOncePerSession} onChange={(e) => updateField("motion", "introOncePerSession", e.target.checked)} />
              Intro once per session
            </label>
            <FormField label="Default Intensity">
              <select className={selectClass} value={(motion.defaultIntensity as string) || "medium"} onChange={(e) => updateField("motion", "defaultIntensity", e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </FormField>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
