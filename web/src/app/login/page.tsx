"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { RedirectIfAuthed } from "@/components/RedirectIfAuthed";
import { loginUser } from "@/lib/auth-api";
import { setAccessToken } from "@/lib/auth-token";
import { dashboardHomeForRole } from "@/lib/dashboard-path";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { roleFromQuery, roleLabel, roleToQueryParam, type AppUserRole } from "@/lib/user-role";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppUserRole>("JOB_SEEKER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRole(roleFromQuery(searchParams.get("role")));
  }, [searchParams]);

  function setAudience(next: AppUserRole) {
    setRole(next);
    const q = roleToQueryParam(next);
    router.replace(`/login?role=${q}`, { scroll: false });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await loginUser({ email: email.trim(), password, role });
      if ("token" in result && "user" in result) {
        setAccessToken(result.token);
        const next = safeRedirectPath(
          searchParams.get("next"),
          dashboardHomeForRole(result.user.role),
        );
        router.push(next);
        router.refresh();
        return;
      }
      setError(result.error?.message ?? "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to home
        </Link>
      </div>
      <div className="mx-auto mt-8 max-w-md pb-10">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Pick the same audience you used when you registered, then enter your credentials.
          </p>

          <div
            role="tablist"
            aria-label="Sign-in audience"
            className="mt-6 flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <button
              type="button"
              role="tab"
              aria-selected={role === "JOB_SEEKER"}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                role === "JOB_SEEKER"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              onClick={() => setAudience("JOB_SEEKER")}
            >
              Job seeker
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={role === "EMPLOYER"}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                role === "EMPLOYER"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              onClick={() => setAudience("EMPLOYER")}
            >
              Employer
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Signing in as: <span className="font-medium text-zinc-700 dark:text-zinc-300">{roleLabel(role)}</span>
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {error ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400/40 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-zinc-600/40"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400/40 focus:border-zinc-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-zinc-600/40"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
              />
            </div>

            <button
              className="mt-2 w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in…" : `Sign in as ${roleLabel(role)}`}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No account?{" "}
            <Link
              href={`/register?role=${roleToQueryParam(role)}`}
              className="font-semibold text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <RedirectIfAuthed>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500">Loading…</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </RedirectIfAuthed>
  );
}
