"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthPageShell, authFieldClass, authLabelClass } from "@/components/marketing/AuthPageShell";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/lib/auth-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (result?.error) {
        setError(result.error.message ?? "Could not send reset email");
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Forgot password"
      subtitle="Enter your email and we will send a reset link if an account exists."
    >
      {sent ? (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          If an account exists for that email, a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className={authLabelClass} htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              className={authFieldClass}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/login" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
          Back to sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
