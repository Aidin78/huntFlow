"use client";

import { EmployerDashboardShell } from "@/components/dashboard/EmployerDashboardShell";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function EmployerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth({ requiredRole: "EMPLOYER" });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading employer dashboard…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <EmployerDashboardShell user={user}>{children}</EmployerDashboardShell>;
}
