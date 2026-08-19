"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, textareaClass, selectClass } from "@/components/admin/FormField";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: string;
}

const emptyForm = { question: "", answer: "", category: "general", order: 0, status: "draft" };

export function FaqsAdmin() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    adminFetch<FAQ[]>("/api/admin/faqs").then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (editing) {
      await adminFetch(`/api/admin/faqs/${editing}`, {
        method: "PUT",
        body: JSON.stringify(form),
        successMessage: "FAQ updated",
      });
    } else {
      await adminFetch("/api/admin/faqs", {
        method: "POST",
        body: JSON.stringify(form),
        successMessage: "FAQ created",
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (item: FAQ) => {
    setForm({ question: item.question, answer: item.answer, category: item.category, order: item.order, status: item.status });
    setEditing(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    await adminFetch(`/api/admin/faqs/${id}`, { method: "DELETE", successMessage: "FAQ deleted" });
    load();
  };

  if (loading) return <div className="text-chrome-mid">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Category">
              <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </FormField>
            <FormField label="Status">
              <select className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </FormField>
            <FormField label="Question" className="sm:col-span-2">
              <input className={inputClass} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </FormField>
            <FormField label="Answer" className="sm:col-span-2">
              <textarea className={textareaClass} rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            </FormField>
            <FormField label="Order">
              <input type="number" className={inputClass} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </FormField>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="rounded-lg border border-chrome-light/20 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-carbon/10 px-2 py-0.5 text-xs">{item.category}</span>
                  <StatusBadge status={item.status} />
                </div>
                <h3 className="mt-2 font-semibold">{item.question}</h3>
                <p className="mt-1 text-sm text-carbon">{item.answer}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleEdit(item)} className="text-royal-blue"><Pencil className="h-4 w-4" /></button>
                <button type="button" onClick={() => handleDelete(item._id)} className="text-deep-magenta"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
