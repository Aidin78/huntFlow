"use client";

import { JobSeekerDashboardShell } from "@/components/dashboard/JobSeekerDashboardShell";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function JobSeekerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth({ requiredRole: "JOB_SEEKER" });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading your dashboard…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <JobSeekerDashboardShell user={user}>{children}</JobSeekerDashboardShell>;
}
