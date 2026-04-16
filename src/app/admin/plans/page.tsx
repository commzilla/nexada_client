"use client";

import { useEffect, useState } from "react";
import { formatCurrency, intervalLabel } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  active: boolean;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    amount: "",
    interval: "month",
    intervalCount: "1",
  });

  async function loadPlans() {
    const res = await fetch("/api/plans");
    const data = await res.json();
    setPlans(data);
    setLoading(false);
  }

  useEffect(() => {
    loadPlans();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      description: "",
      amount: "",
      interval: "month",
      intervalCount: "1",
    });
    setEditingPlan(null);
    setShowForm(false);
  }

  function startEdit(plan: Plan) {
    setForm({
      name: plan.name,
      description: plan.description || "",
      amount: String(plan.amount),
      interval: plan.interval,
      intervalCount: String(plan.intervalCount),
    });
    setEditingPlan(plan);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const url = editingPlan ? `/api/plans/${editingPlan.id}` : "/api/plans";
    const method = editingPlan ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    resetForm();
    loadPlans();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to deactivate this plan?")) return;
    await fetch(`/api/plans/${id}`, { method: "DELETE" });
    loadPlans();
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
          <h1 className="text-2xl font-bold text-gray-900">Plans</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your subscription plans
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Plan
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-gray-200 bg-white p-6"
        >
          <h3 className="mb-4 text-lg font-semibold">
            {editingPlan ? "Edit Plan" : "New Plan"}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 2999 for $29.99"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Billing Interval
              </label>
              <select
                value={form.interval}
                onChange={(e) => setForm({ ...form, interval: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
                <option value="one_time">One-time</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Interval Count
              </label>
              <input
                type="number"
                min="1"
                value={form.intervalCount}
                onChange={(e) =>
                  setForm({ ...form, intervalCount: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={form.interval === "one_time"}
              />
              <p className="mt-1 text-xs text-gray-500">
                e.g. 3 with Monthly = every 3 months
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {editingPlan ? "Update Plan" : "Create Plan"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {plan.name}
              </h3>
              <span className="text-2xl font-bold text-indigo-600">
                {formatCurrency(plan.amount, plan.currency)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {intervalLabel(plan.interval, plan.intervalCount)}
            </p>
            {plan.description && (
              <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => startEdit(plan)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Deactivate
              </button>
            </div>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No plans yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first subscription plan to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
