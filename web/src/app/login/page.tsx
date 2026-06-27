"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { AuthPageShell, authFieldClass, authLabelClass } from "@/components/marketing/AuthPageShell";
import { RedirectIfAuthed } from "@/components/RedirectIfAuthed";
import { Button } from "@/components/ui/button";
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
    <AuthPageShell
      title="Sign in"
      subtitle="Pick the same audience you used when you registered, then enter your credentials."
    >
      <div
        role="tablist"
        aria-label="Sign-in audience"
        className="mt-6 grid grid-cols-3 gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/60"
      >
        <button
          type="button"
          role="tab"
          aria-selected={role === "JOB_SEEKER"}
          className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
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
          className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
            role === "EMPLOYER"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
          onClick={() => setAudience("EMPLOYER")}
        >
          Employer
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={role === "PLATFORM_ADMIN"}
          className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
            role === "PLATFORM_ADMIN"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
          onClick={() => setAudience("PLATFORM_ADMIN")}
        >
          Platform admin
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Signing in as: <span className="font-medium text-zinc-700 dark:text-zinc-300">{roleLabel(role)}</span>
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {error ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className={authLabelClass} htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            className={authFieldClass}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label className={authLabelClass} htmlFor="login-password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-300"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            className={authFieldClass}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? "Signing in…" : `Sign in as ${roleLabel(role)}`}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        {role === "PLATFORM_ADMIN" ? (
          <>Platform admin accounts are provisioned by huntFlow operations.</>
        ) : (
          <>
            No account?{" "}
            <Link
              href={`/register?role=${roleToQueryParam(role)}`}
              className="font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
            >
              Create one
            </Link>
          </>
        )}
      </p>
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <RedirectIfAuthed>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-sm text-zinc-500">Loading…</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </RedirectIfAuthed>
  );
}
