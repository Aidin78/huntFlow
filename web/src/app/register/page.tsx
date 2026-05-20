"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { AuthPageShell, authFieldClass, authLabelClass } from "@/components/marketing/AuthPageShell";
import { RedirectIfAuthed } from "@/components/RedirectIfAuthed";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/lib/auth-api";
import { setAccessToken } from "@/lib/auth-token";
import { dashboardHomeForRole } from "@/lib/dashboard-path";
import { roleFromQuery, roleLabel, roleToQueryParam, type AppUserRole } from "@/lib/user-role";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
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
    router.replace(`/register?role=${q}`, { scroll: false });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        role,
      });
      if ("token" in result && "user" in result) {
        setAccessToken(result.token);
        router.push(dashboardHomeForRole(result.user.role));
        router.refresh();
        return;
      }
      setError(result.error?.message ?? "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Create account"
      subtitle="Choose whether you are signing up as a job seeker or an employer."
    >
      <div
        role="tablist"
        aria-label="Account type"
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
        Registering as: <span className="font-medium text-zinc-700 dark:text-zinc-300">{roleLabel(role)}</span>
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
          <label className={authLabelClass} htmlFor="register-name">
            Name <span className="font-normal normal-case text-zinc-400">(optional)</span>
          </label>
          <input
            id="register-name"
            className={authFieldClass}
            type="text"
            autoComplete="name"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className={authLabelClass} htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            className={authFieldClass}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className={authLabelClass} htmlFor="register-password">
            Password
          </label>
          <input
            id="register-password"
            className={authFieldClass}
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">At least 8 characters.</p>
        </div>

        <Button type="submit" variant="success" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? "Creating account…" : `Create ${roleLabel(role)} account`}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href={`/login?role=${roleToQueryParam(role)}`}
          className="font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
        >
          Sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}

export default function RegisterPage() {
  return (
    <RedirectIfAuthed>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-sm text-zinc-500">Loading…</p>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </RedirectIfAuthed>
  );
}
