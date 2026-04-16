"use client";

import { useEffect, useState } from "react";
import { formatCurrency, intervalLabel } from "@/lib/utils";

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/plans");
      const data = await res.json();
      setPlans(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubscribe(planId: string) {
    setSubscribing(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch {
      alert("Failed to start checkout");
    }
    setSubscribing(null);
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
      <h1 className="text-2xl font-bold text-gray-900">
        Available Subscriptions
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Choose a plan that fits your needs
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              {plan.name}
            </h3>
            <p className="text-sm text-gray-500">
              {intervalLabel(plan.interval, plan.intervalCount)}
            </p>
            {plan.description && (
              <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
            )}
            <div className="mt-4 flex-1">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(plan.amount, plan.currency)}
              </span>
              {plan.interval !== "one_time" && (
                <span className="text-sm text-gray-500">
                  {plan.intervalCount > 1
                    ? ` / ${plan.intervalCount} ${plan.interval}s`
                    : ` / ${plan.interval}`}
                </span>
              )}
            </div>
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={subscribing === plan.id}
              className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {subscribing === plan.id
                ? "Redirecting..."
                : plan.interval === "one_time"
                  ? "Pay Now"
                  : "Subscribe"}
            </button>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="col-span-full rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No plans available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Check back later for available subscription plans.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
