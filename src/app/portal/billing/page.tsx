"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, intervalLabel } from "@/lib/utils";

export default function BillingPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      setSubs(data);
      setLoading(false);
    }
    load();
  }, []);

  async function openStripePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Could not open billing portal");
      }
    } catch {
      alert("Failed to open billing portal");
    }
    setPortalLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your payment methods and view billing history
          </p>
        </div>
        <button
          onClick={openStripePortal}
          disabled={portalLoading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {portalLoading ? "Opening..." : "Manage Payment Methods"}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Subscription History
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Interval
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Started
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subs.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {sub.plan?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(
                      sub.plan?.amount || 0,
                      sub.plan?.currency
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {sub.plan
                      ? intervalLabel(
                          sub.plan.interval,
                          sub.plan.intervalCount
                        )
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={sub.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(sub.createdAt)}
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No billing history
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
