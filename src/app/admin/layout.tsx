"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: "\u25A0" },
  { label: "Plans", href: "/admin/plans", icon: "\u2630" },
  { label: "Clients", href: "/admin/clients", icon: "\u263A" },
  { label: "Payments", href: "/admin/payments", icon: "\u2B24" },
  { label: "Payment Links", href: "/admin/payment-links", icon: "\u2197" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any).role !== "admin") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={adminNav} title="Admin" />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
