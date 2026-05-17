"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { JobApplyButton } from "@/components/jobs/JobApplyButton";
import { SiteHeader } from "@/components/SiteHeader";
import {
  experienceLabel,
  fetchJobListing,
  formatPublishedDate,
  type JobListingDetail,
  workArrangementLabel,
  type WorkArrangement,
} from "@/lib/job-listings-api";

function arrangementTone(w: WorkArrangement): string {
  switch (w) {
    case "REMOTE":
      return "bg-sky-500/12 text-sky-800 ring-sky-500/20 dark:bg-sky-400/15 dark:text-sky-200 dark:ring-sky-400/25";
    case "HYBRID":
      return "bg-violet-500/12 text-violet-800 ring-violet-500/20 dark:bg-violet-400/15 dark:text-violet-200 dark:ring-violet-400/25";
    default:
      return "bg-zinc-500/10 text-zinc-700 ring-zinc-500/15 dark:bg-zinc-400/10 dark:text-zinc-200 dark:ring-zinc-400/20";
  }
}

export default function JobDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [job, setJob] = useState<JobListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const item = await fetchJobListing(id);
        if (cancelled) return;
        if (!item) {
          setNotFound(true);
          setJob(null);
        } else {
          setJob(item);
        }
      } catch {
        if (!cancelled) setError("Could not load this role. Is the API running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const initial = job?.company.name.trim().charAt(0).toUpperCase() ?? "?";

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(165deg,rgb(244_244_245)_0%,rgb(250_250_250)_45%,rgb(255_255_255)_100%)] dark:bg-[linear-gradient(165deg,rgb(9_9_11)_0%,rgb(24_24_27)_55%,rgb(9_9_11)_100%)]"
      />

      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <Link
          href="/jobs"
          className="inline-flex text-sm font-semibold text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← All jobs
        </Link>

        {loading ? <p className="mt-16 text-center text-sm text-zinc-500">Loading role…</p> : null}

        {error ? (
          <p className="mt-10 rounded-3xl border border-amber-200/90 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            {error}
          </p>
        ) : null}

        {notFound && !loading ? (
          <div className="mt-16 text-center">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Role not found</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This listing may have been removed or is no longer active.
            </p>
            <Link
              href="/jobs"
              className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Browse jobs
            </Link>
          </div>
        ) : null}

        {job && !loading ? (
          <article className="mt-8">
            <header className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-lg shadow-zinc-900/5 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:shadow-black/25 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-xl font-bold text-emerald-800 dark:from-emerald-500/25 dark:to-teal-500/15 dark:text-emerald-200"
                    aria-hidden
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
                      {job.company.name}
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
                      {job.title}
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">Posted {formatPublishedDate(job.publishedAt)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${arrangementTone(job.workArrangement)}`}
                      >
                        {workArrangementLabel(job.workArrangement)}
                      </span>
                      <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-100 dark:ring-emerald-400/25">
                        {experienceLabel(job.experienceLevel)}
                      </span>
                      {job.salaryText ? (
                        <span className="inline-flex rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-400/15 dark:text-zinc-200">
                          {job.salaryText}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <JobApplyButton listingId={job.id} size="large" className="w-full sm:w-auto sm:min-w-[220px]" />
              </div>
            </header>

            <section className="mt-8 space-y-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Location
                  </h2>
                  <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {job.city ?? "Not specified"}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Work style
                  </h2>
                  <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {workArrangementLabel(job.workArrangement)}
                  </p>
                </div>
              </div>

              {job.summary ? (
                <div className="rounded-3xl border border-zinc-200/80 bg-white/80 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/50 sm:p-8">
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">About this role</h2>
                  <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">{job.summary}</p>
                </div>
              ) : null}

              {(job.company.website || job.company.linkedin || job.sourceUrl) && (
                <div className="rounded-3xl border border-zinc-200/80 bg-white/80 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/50 sm:p-8">
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Links</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {job.company.website ? (
                      <li>
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
                        >
                          Company website
                        </a>
                      </li>
                    ) : null}
                    {job.company.linkedin ? (
                      <li>
                        <a
                          href={job.company.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
                        >
                          Company on LinkedIn
                        </a>
                      </li>
                    ) : null}
                    {job.sourceUrl ? (
                      <li>
                        <a
                          href={job.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400"
                        >
                          Original job posting
                        </a>
                      </li>
                    ) : null}
                  </ul>
                </div>
              )}
            </section>

            <div className="mt-10 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 dark:border-emerald-500/25 dark:bg-emerald-950/30 sm:p-8">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Ready to apply?</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Save this role to your huntFlow pipeline. You must be signed in as a job seeker.
              </p>
              <JobApplyButton listingId={job.id} size="large" className="mt-6" />
            </div>
          </article>
        ) : null}
      </main>
    </div>
  );
}
