"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Testimonial {
  _id: string;
  customerName: string;
  title?: string;
  location?: string;
  testimonial: string;
  rating?: number;
  order: number;
  featured: boolean;
  status: string;
}

const emptyForm = {
  customerName: "",
  title: "",
  location: "",
  testimonial: "",
  rating: 5,
  order: 0,
  featured: false,
  status: "draft",
};

export function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    adminFetch<Testimonial[]>("/api/admin/testimonials")
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (editing) {
      await adminFetch(`/api/admin/testimonials/${editing}`, {
        method: "PUT",
        body: JSON.stringify(form),
        successMessage: "Testimonial updated",
      });
    } else {
      await adminFetch("/api/admin/testimonials", {
        method: "POST",
        body: JSON.stringify(form),
        successMessage: "Testimonial created",
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (item: Testimonial) => {
    setForm({
      customerName: item.customerName,
      title: item.title || "",
      location: item.location || "",
      testimonial: item.testimonial,
      rating: item.rating || 5,
      order: item.order,
      featured: item.featured,
      status: item.status,
    });
    setEditing(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await adminFetch(`/api/admin/testimonials/${id}`, {
      method: "DELETE",
      successMessage: "Testimonial deleted",
    });
    load();
  };

  if (loading) return <div className="text-chrome-mid">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">{editing ? "Edit" : "New"} Testimonial</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Customer Name">
              <input className={inputClass} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </FormField>
            <FormField label="Title">
              <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </FormField>
            <FormField label="Location">
              <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </FormField>
            <FormField label="Rating">
              <input type="number" min={1} max={5} className={inputClass} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            </FormField>
            <FormField label="Status">
              <select className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </FormField>
            <FormField label="Order">
              <input type="number" className={inputClass} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </FormField>
            <FormField label="Testimonial" className="sm:col-span-2">
              <textarea className={textareaClass} rows={4} value={form.testimonial} onChange={(e) => setForm({ ...form, testimonial: e.target.value })} />
            </FormField>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="flex items-start justify-between gap-4 rounded-lg border border-chrome-light/20 bg-white p-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{item.customerName}</h3>
                <StatusBadge status={item.status} />
                {item.featured && <span className="text-xs text-royal-blue">Featured</span>}
              </div>
              {item.title && <p className="text-sm text-chrome-mid">{item.title}</p>}
              <p className="mt-2 text-sm">{item.testimonial}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => handleEdit(item)} className="text-royal-blue"><Pencil className="h-4 w-4" /></button>
              <button type="button" onClick={() => handleDelete(item._id)} className="text-deep-magenta"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
