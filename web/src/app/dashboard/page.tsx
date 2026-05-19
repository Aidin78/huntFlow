"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { fetchMe } from "@/lib/auth-api";
import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { dashboardHomeForRole } from "@/lib/dashboard-path";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    (async () => {
      const result = await fetchMe(token);
      if (cancelled) return;

      if (!("user" in result) || !result.user) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      router.replace(dashboardHomeForRole(result.user.role));
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading dashboard…</p>
    </div>
  );
}
