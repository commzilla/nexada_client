"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
      setLoading(false);
    }
    load();
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
      <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
      <p className="mt-1 text-sm text-gray-500">
        View all registered clients and their subscriptions
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Subscriptions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Payments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {client.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {client.email}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {client.subscriptions.length > 0 ? (
                      client.subscriptions.map((sub: any) => (
                        <div key={sub.id} className="flex items-center gap-2">
                          <Badge status={sub.status} />
                          <span className="text-sm text-gray-600">
                            {sub.plan.name} -{" "}
                            {formatCurrency(sub.plan.amount, sub.plan.currency)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">None</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {client._count.payments}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(client.createdAt)}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No clients registered yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
