"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button, LinkButton, buttonClass } from "@/components/ui/button";
import { fetchMe } from "@/lib/auth-api";
import { getAccessToken } from "@/lib/auth-token";
import { applyToJobListing, fetchJobApplyStatus } from "@/lib/job-listings-api";
import { fetchSeekerProfile, uploadSeekerResume, type UserFileMeta } from "@/lib/seeker-profile-api";
import { roleToQueryParam } from "@/lib/user-role";

type JobApplyButtonProps = {
  listingId: string;
  className?: string;
  size?: "default" | "large";
};

const COVER_LETTER_MAX = 4000;

export function JobApplyButton({ listingId, className = "", size = "default" }: JobApplyButtonProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [wrongRole, setWrongRole] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [profileResume, setProfileResume] = useState<UserFileMeta | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

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

  async function openApplyModal() {
    const token = getAccessToken();
    if (!token) {
      router.push(loginHref);
      return;
    }
    setError(null);
    const profile = await fetchSeekerProfile();
    if ("profile" in profile) {
      const resume = profile.profile?.resume ?? null;
      setProfileResume(resume);
      setHasResume(Boolean(resume));
      setSelectedResumeId(resume?.id ?? null);
    }
    setModalOpen(true);
  }

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

      const trimmed = coverLetter.trim();
      const result = await applyToJobListing(listingId, token, {
        coverLetter: trimmed || undefined,
        resumeFileId: selectedResumeId ?? undefined,
      });
      if ("error" in result && result.error) {
        setError(result.error.message ?? "Could not apply");
        return;
      }
      if ("application" in result && result.application) {
        setApplied(true);
        setModalOpen(false);
        setCoverLetter("");
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
        className={buttonClass("secondary", size === "large" ? "lg" : "md", `opacity-70 ${className}`)}
      >
        …
      </button>
    );
  }

  if (!authed) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <LinkButton href={loginHref} variant="emerald" size={size === "large" ? "lg" : "md"}>
          Sign in to apply
        </LinkButton>
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
        <LinkButton href={loginHref} variant="secondary" size={size === "large" ? "lg" : "md"}>
          Sign in as job seeker
        </LinkButton>
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
          href="/dashboard/seeker"
          className="text-center text-xs font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Open dashboard
        </Link>
      </div>
    );
  }

  return (
  <>
    <div className={`flex flex-col gap-2 ${className}`}>
      {error && !modalOpen ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        variant="emerald"
        size={size === "large" ? "lg" : "md"}
        onClick={() => void openApplyModal()}
        className="w-full sm:w-auto"
      >
        Apply with huntFlow
      </Button>
    </div>

    {modalOpen ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
      >
        <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          <h2 id="apply-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Apply to this role
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Optional cover letter for the employer. Your profile details are shared automatically.
          </p>
          {hasResume === false ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              No resume on file yet. Upload one below to attach it to this application.
            </p>
          ) : null}
          <div className="mt-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Resume</p>
            {profileResume ? (
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {profileResume.filename}
              </p>
            ) : (
              <p className="mt-1 text-sm text-zinc-500">No resume selected</p>
            )}
            <label className="mt-3 inline-block">
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                disabled={applying || uploadingResume}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void (async () => {
                    setUploadingResume(true);
                    setError(null);
                    const uploaded = await uploadSeekerResume(file);
                    setUploadingResume(false);
                    if ("error" in uploaded && uploaded.error) {
                      setError(uploaded.error.message ?? "Could not upload resume");
                      return;
                    }
                    if ("resume" in uploaded) {
                      setProfileResume(uploaded.resume);
                      setSelectedResumeId(uploaded.resume.id);
                      setHasResume(true);
                    }
                  })();
                }}
              />
              <span className="inline-flex min-h-8 cursor-pointer items-center rounded-full border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200">
                {uploadingResume ? "Uploading…" : "Upload different resume"}
              </span>
            </label>
          </div>
          <label htmlFor="cover-letter" className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Cover letter (optional)
          </label>
          <textarea
            id="cover-letter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value.slice(0, COVER_LETTER_MAX))}
            rows={6}
            placeholder="Why you are a good fit…"
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <p className="mt-1 text-right text-xs text-zinc-400">
            {coverLetter.length}/{COVER_LETTER_MAX}
          </p>
          {error ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={applying}>
              Cancel
            </Button>
            <Button type="button" variant="emerald" onClick={() => void handleApply()} disabled={applying}>
              {applying ? "Submitting…" : "Submit application"}
            </Button>
          </div>
        </div>
      </div>
    ) : null}
  </>
  );
}
