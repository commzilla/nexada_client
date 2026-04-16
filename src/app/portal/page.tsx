"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, intervalLabel } from "@/lib/utils";

export default function PortalDashboard() {
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      setSubs(data);
      setLoading(false);
    }
    load();
  }, []);

  const activeSubs = subs.filter((s) => s.status === "active");
  const totalMonthly = activeSubs.reduce(
    (sum, s) => sum + (s.plan?.amount || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {checkout === "success" && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          Payment successful! Your subscription is now active.
        </div>
      )}
      {checkout === "canceled" && (
        <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
          Checkout was canceled. You can try again anytime.
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Overview of your subscriptions and billing
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard label="Active Subscriptions" value={activeSubs.length} />
        <StatCard
          label="Monthly Spend"
          value={formatCurrency(totalMonthly)}
        />
        <StatCard label="Total Subscriptions" value={subs.length} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Current Subscriptions
        </h2>
        {activeSubs.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activeSubs.map((sub) => (
              <div
                key={sub.id}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {sub.plan?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {intervalLabel(
                        sub.plan?.interval,
                        sub.plan?.intervalCount
                      )}
                    </p>
                  </div>
                  <Badge status={sub.status} />
                </div>
                <p className="mt-3 text-2xl font-bold text-indigo-600">
                  {formatCurrency(sub.plan?.amount || 0, sub.plan?.currency)}
                </p>
                {sub.currentPeriodEnd && (
                  <p className="mt-1 text-xs text-gray-500">
                    Next billing: {formatDate(sub.currentPeriodEnd)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">No active subscriptions</p>
            <a
              href="/portal/subscriptions"
              className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Browse available plans
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
