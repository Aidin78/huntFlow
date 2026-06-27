"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AuthPageShell, authFieldClass, authLabelClass } from "@/components/marketing/AuthPageShell";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/auth-api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token. Use the link from your email.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (result?.error) {
        setError(result.error.message ?? "Could not reset password");
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p className="mt-6 text-sm text-red-600 dark:text-red-400">
        This reset link is invalid. Request a new one from the forgot password page.
      </p>
    );
  }

  return done ? (
    <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
      Your password was updated.{" "}
      <Link href="/login" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
        Sign in
      </Link>
    </p>
  ) : (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <label className={authLabelClass} htmlFor="reset-password">
          New password
        </label>
        <input
          id="reset-password"
          className={authFieldClass}
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
        {loading ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthPageShell title="Reset password" subtitle="Choose a new password for your huntFlow account.">
      <Suspense fallback={<p className="mt-6 text-sm text-zinc-500">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
