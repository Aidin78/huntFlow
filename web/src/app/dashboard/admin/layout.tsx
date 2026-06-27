"use client";

import { AdminDashboardShell } from "@/components/dashboard/AdminDashboardShell";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth({
    requiredRole: "PLATFORM_ADMIN",
    loginPath: "/login?role=admin",
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading admin dashboard…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AdminDashboardShell user={user}>{children}</AdminDashboardShell>;
}
