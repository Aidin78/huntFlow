"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { fetchMe } from "@/lib/auth-api";
import { getAccessToken } from "@/lib/auth-token";
import { applyToJobListing, fetchJobApplyStatus } from "@/lib/job-listings-api";
import { roleToQueryParam } from "@/lib/user-role";

type JobApplyButtonProps = {
  listingId: string;
  className?: string;
  size?: "default" | "large";
};

export function JobApplyButton({ listingId, className = "", size = "default" }: JobApplyButtonProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [wrongRole, setWrongRole] = useState(false);

  const sizeClass =
    size === "large" ? "min-h-12 px-8 text-sm" : "min-h-10 px-5 text-sm";

  const loginHref = `/login?role=${roleToQueryParam("JOB_SEEKER")}&next=${encodeURIComponent(`/jobs/${listingId}`)}`;

  const refreshStatus = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setAuthed(false);
      setApplied(false);
      setWrongRole(false);
      setChecking(false);
      return;
    }

    const me = await fetchMe(token);
    if (!("user" in me) || !me.user) {
      setAuthed(false);
      setChecking(false);
      return;
    }

    setAuthed(true);

    if (me.user.role !== "JOB_SEEKER") {
      setWrongRole(true);
      setChecking(false);
      return;
    }

    setWrongRole(false);
    const status = await fetchJobApplyStatus(listingId, token);
    if ("applied" in status) {
      setApplied(status.applied);
    }
    setChecking(false);
  }, [listingId]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  async function handleApply() {
    const token = getAccessToken();
    if (!token) {
      router.push(loginHref);
      return;
    }

    setError(null);
    setApplying(true);
    try {
      const me = await fetchMe(token);
      if (!("user" in me) || !me.user) {
        router.push(loginHref);
        return;
      }
      if (me.user.role !== "JOB_SEEKER") {
        setError("Sign in with a job seeker account to apply.");
        return;
      }

      const result = await applyToJobListing(listingId, token);
      if ("error" in result && result.error) {
        setError(result.error.message ?? "Could not apply");
        return;
      }
      if ("application" in result && result.application) {
        setApplied(true);
      }
    } finally {
      setApplying(false);
    }
  }

  if (checking) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center justify-center rounded-full bg-zinc-200 font-semibold text-zinc-500 ${sizeClass} ${className}`}
      >
        …
      </button>
    );
  }

  if (!authed) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Link
          href={loginHref}
          className={`inline-flex items-center justify-center rounded-full bg-emerald-600 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 ${sizeClass}`}
        >
          Sign in to apply
        </Link>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          You need a job seeker account to track this application in huntFlow.
        </p>
      </div>
    );
  }

  if (wrongRole) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Employer accounts cannot apply to listings. Switch to a job seeker account.
        </p>
        <Link
          href={loginHref}
          className={`inline-flex items-center justify-center rounded-full border border-zinc-300 font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800 ${sizeClass}`}
        >
          Sign in as job seeker
        </Link>
      </div>
    );
  }

  if (applied) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <span
          className={`inline-flex items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 font-semibold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-100 ${sizeClass}`}
        >
          Applied — in your pipeline
        </span>
        <Link
          href="/dashboard"
          className="text-center text-xs font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
        >
          Open dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => void handleApply()}
        disabled={applying}
        className={`inline-flex items-center justify-center rounded-full bg-emerald-600 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-60 ${sizeClass}`}
      >
        {applying ? "Applying…" : "Apply with huntFlow"}
      </button>
    </div>
  );
}
