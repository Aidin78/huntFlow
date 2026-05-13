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
  const [error, setError] = useState<string | null>(null);
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
      if (cancelled) {
        return;
      }
      if ("user" in result) {
        setUser(result.user);
        setLoading(false);
        return;
      }
      clearAccessToken();
      setError(result.error?.message ?? "Session expired");
      setLoading(false);
      router.replace("/login");
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

  if (error) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:px-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as <span className="font-medium text-zinc-900 dark:text-zinc-100">{user?.email}</span>
            {user?.name ? <span className="text-zinc-500"> ({user.name})</span> : null}
            {user ? (
              <span className="mt-2 block text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Audience: {roleLabel(user.role)}
              </span>
            ) : null}
          </p>

          <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="font-semibold text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100">
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
