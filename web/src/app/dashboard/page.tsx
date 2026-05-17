"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import { fetchMe, type AuthUser } from "@/lib/auth-api";
import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { roleLabel } from "@/lib/user-role";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    let cancelled = false;
    (async () => {
      const result = await fetchMe(token);
      if (cancelled) return;

      if (!("user" in result) || !result.user) {
        clearAccessToken();
        setLoading(false);
        router.replace("/login");
        return;
      }

      if (result.user.role === "EMPLOYER") {
        router.replace("/dashboard/employer");
        return;
      }

      setUser(result.user);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
            Job seeker
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Your dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as <span className="font-medium text-zinc-900 dark:text-zinc-100">{user.email}</span>
            {user.name ? <span className="text-zinc-500"> ({user.name})</span> : null}
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Audience: {roleLabel(user.role)}
          </p>

          <Link
            href="/jobs"
            className="mt-8 inline-flex justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Browse jobs
          </Link>
        </div>
      </main>
    </div>
  );
}
