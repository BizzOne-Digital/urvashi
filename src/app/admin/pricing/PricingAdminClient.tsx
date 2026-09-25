"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/admin/FormField";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface PricingRule {
  _id: string;
  productName?: string;
  productSlug?: string;
  basePrice?: number;
  currency: string;
  pricingMode: string;
  minQuantity: number;
  publicNote?: string;
  isActive: boolean;
}

export function PricingAdminClient({ products }: { products: Array<{ _id: string; name: string; slug: string }> }) {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    productSlug: "",
    productName: "",
    basePrice: "",
    pricingMode: "fixed",
    minQuantity: "1",
    publicNote: "",
    isActive: true,
  });

  const loadRules = () => {
    setLoading(true);
    adminFetch<PricingRule[]>("/api/admin/pricing")
      .then(setRules)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRules();
  }, []);

  const resetForm = () => {
    setForm({
      productSlug: "",
      productName: "",
      basePrice: "",
      pricingMode: "fixed",
      minQuantity: "1",
      publicNote: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreate = async () => {
    const product = products.find((p) => p.slug === form.productSlug);
    await adminFetch("/api/admin/pricing", {
      method: "POST",
      body: JSON.stringify({
        productId: product?._id,
        productSlug: form.productSlug,
        productName: form.productName || product?.name,
        basePrice: form.basePrice ? Number(form.basePrice) : undefined,
        pricingMode: form.pricingMode,
        minQuantity: Number(form.minQuantity),
        publicNote: form.publicNote || undefined,
        isActive: form.isActive,
        currency: "CAD",
      }),
      successMessage: "Pricing rule created",
    });
    resetForm();
    loadRules();
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await adminFetch(`/api/admin/pricing/${editingId}`, {
      method: "PUT",
      body: JSON.stringify({
        basePrice: form.basePrice ? Number(form.basePrice) : undefined,
        pricingMode: form.pricingMode,
        minQuantity: Number(form.minQuantity),
        publicNote: form.publicNote || undefined,
        isActive: form.isActive,
        currency: "CAD",
      }),
      successMessage: "Pricing updated — shop and pricing page refreshed",
    });
    resetForm();
    loadRules();
  };

  const startEdit = (rule: PricingRule) => {
    setEditingId(rule._id);
    setShowForm(true);
    setForm({
      productSlug: rule.productSlug || "",
      productName: rule.productName || "",
      basePrice: rule.basePrice != null ? String(rule.basePrice) : "",
      pricingMode: rule.pricingMode,
      minQuantity: String(rule.minQuantity),
      publicNote: rule.publicNote || "",
      isActive: rule.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pricing rule?")) return;
    await adminFetch(`/api/admin/pricing/${id}`, {
      method: "DELETE",
      successMessage: "Rule deleted",
    });
    loadRules();
  };

  const handleToggle = async (rule: PricingRule) => {
    await adminFetch(`/api/admin/pricing/${rule._id}`, {
      method: "PUT",
      body: JSON.stringify({ isActive: !rule.isActive }),
      successMessage: "Rule updated",
    });
    loadRules();
  };

  if (loading) return <div className="text-chrome-mid">Loading pricing rules…</div>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-chrome-mid">
        Update prices here — changes sync to products, shop, cart, and the public pricing page.
      </p>

      <div className="flex justify-end">
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          Add rule
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-chrome-light/20 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">{editingId ? "Edit pricing rule" : "New pricing rule"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Product">
              <select
                className={selectClass}
                value={form.productSlug}
                disabled={Boolean(editingId)}
                onChange={(e) => {
                  const p = products.find((pr) => pr.slug === e.target.value);
                  setForm({ ...form, productSlug: e.target.value, productName: p?.name || "" });
                }}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p._id} value={p.slug}>{p.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Base price">
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              />
            </FormField>
            <FormField label="Pricing mode">
              <select
                className={selectClass}
                value={form.pricingMode}
                onChange={(e) => setForm({ ...form, pricingMode: e.target.value })}
              >
                <option value="fixed">Fixed</option>
                <option value="quote">Quote</option>
              </select>
            </FormField>
            <FormField label="Min quantity">
              <input
                type="number"
                className={inputClass}
                value={form.minQuantity}
                onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
              />
            </FormField>
            <FormField label="Public note" className="sm:col-span-2">
              <textarea
                className={textareaClass}
                rows={2}
                value={form.publicNote}
                onChange={(e) => setForm({ ...form, publicNote: e.target.value })}
                placeholder="e.g. Minimum order 5 pens"
              />
            </FormField>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button onClick={editingId ? handleUpdate : handleCreate}>
              {editingId ? "Save changes" : "Create rule"}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-chrome-light/20 bg-white shadow-sm">
        {rules.length === 0 ? (
          <p className="p-8 text-center text-chrome-mid">No pricing rules yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-carbon/5 text-left">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Mode</th>
                <th className="px-4 py-3 font-semibold">Min qty</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rules.map((rule) => (
                <tr key={rule._id}>
                  <td className="px-4 py-3">{rule.productName || rule.productSlug || "—"}</td>
                  <td className="px-4 py-3">
                    {rule.basePrice != null ? formatCurrency(rule.basePrice, rule.currency) : "—"}
                  </td>
                  <td className="px-4 py-3">{rule.pricingMode}</td>
                  <td className="px-4 py-3">{rule.minQuantity}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleToggle(rule)}>
                      <StatusBadge status={rule.isActive ? "published" : "archived"} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(rule)} className="text-royal-blue hover:text-royal-blue/80">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(rule._id)} className="text-deep-magenta hover:text-deep-magenta/80">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
