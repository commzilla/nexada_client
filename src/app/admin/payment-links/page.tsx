"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PaymentLink {
  id: string;
  name: string;
  amount: number;
  currency: string;
  description: string | null;
  active: boolean;
  url: string | null;
  createdAt: string;
}

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    description: "",
  });

  async function loadLinks() {
    const res = await fetch("/api/payment-links");
    const data = await res.json();
    setLinks(data);
    setLoading(false);
  }

  useEffect(() => {
    loadLinks();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    const res = await fetch("/api/payment-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ name: "", amount: "", description: "" });
      setShowForm(false);
      loadLinks();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create payment link");
    }
    setCreating(false);
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this payment link? It will no longer accept payments.")) return;
    await fetch("/api/payment-links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadLinks();
  }

  function copyLink(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Links</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate one-time payment links to send to clients
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Payment Link
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-gray-200 bg-white p-6"
        >
          <h3 className="mb-4 text-lg font-semibold">New Payment Link</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Label / Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder='e.g. "Invoice #1234" or "Setup Fee"'
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Amount (in cents)
              </label>
              <input
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 5000 for $50.00"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What is this payment for?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Payment Link"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {links.map((link) => (
          <div
            key={link.id}
            className={`rounded-xl border bg-white p-5 ${link.active ? "border-gray-200" : "border-gray-100 opacity-60"}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{link.name}</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      link.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {link.active ? "Active" : "Deactivated"}
                  </span>
                </div>
                {link.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {link.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Created {formatDate(link.createdAt)}
                </p>
              </div>
              <span className="text-xl font-bold text-indigo-600">
                {formatCurrency(link.amount, link.currency)}
              </span>
            </div>

            {link.url && link.active && (
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={link.url}
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                />
                <button
                  onClick={() => copyLink(link.url!, link.id)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {copied === link.id ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => handleDeactivate(link.id)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Deactivate
                </button>
              </div>
            )}
          </div>
        ))}

        {links.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No payment links yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a payment link to send to a client for a one-time charge.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
