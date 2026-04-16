"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    activeSubs: 0,
    totalRevenue: 0,
    recentPayments: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [clientsRes, subsRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/subscriptions"),
      ]);
      const clients = await clientsRes.json();
      const subs = await subsRes.json();

      const activeSubs = subs.filter((s: any) => s.status === "active");

      // Gather all payments from clients
      const allPayments: any[] = [];
      for (const client of clients) {
        const paymentsRes = await fetch(`/api/subscriptions`);
        if (paymentsRes.ok) {
          // We'll compute revenue from subscriptions for now
        }
      }

      setStats({
        clients: clients.length,
        activeSubs: activeSubs.length,
        totalRevenue: activeSubs.reduce(
          (sum: number, s: any) => sum + (s.plan?.amount || 0),
          0
        ),
        recentPayments: subs.slice(0, 5),
      });
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Overview of your subscription business
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard label="Total Clients" value={stats.clients} />
        <StatCard label="Active Subscriptions" value={stats.activeSubs} />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(stats.totalRevenue)}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Subscriptions
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentPayments.map((sub: any) => (
                <tr key={sub.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {sub.user?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {sub.plan?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={sub.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(sub.createdAt)}
                  </td>
                </tr>
              ))}
              {stats.recentPayments.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No subscriptions yet
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
