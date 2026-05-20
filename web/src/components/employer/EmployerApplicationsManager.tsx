"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { ActionLink, LinkButton } from "@/components/ui/button";
import {
  fetchEmployerApplications,
  type EmployerApplication,
  type EmployerApplicationJobOption,
} from "@/lib/employer-applications-api";

const PAGE_SIZE = 10;

const fieldClass =
  "mt-1.5 w-full max-w-md rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function applicantName(row: EmployerApplication): string {
  return row.user.name?.trim() || row.user.email;
}

function ApplicationsIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

export function EmployerApplicationsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobFromUrl = searchParams.get("job") ?? "";

  const [items, setItems] = useState<EmployerApplication[]>([]);
  const [jobListings, setJobListings] = useState<EmployerApplicationJobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(jobFromUrl);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  const syncJobInUrl = useCallback(
    (jobId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (jobId) params.set("job", jobId);
      else params.delete("job");
      const qs = params.toString();
      router.replace(qs ? `/dashboard/employer/applications?${qs}` : "/dashboard/employer/applications", {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const loadPage = useCallback(
    async (opts: { cursor?: string; jobListingId?: string; append: boolean }) => {
      const result = await fetchEmployerApplications({
        cursor: opts.cursor,
        jobListingId: opts.jobListingId || undefined,
        limit: PAGE_SIZE,
      });

      if ("error" in result && result.error) {
        setError(result.error.message ?? "Could not load applications");
        return false;
      }

      if ("items" in result) {
        setItems((prev) => (opts.append ? [...prev, ...result.items] : result.items));
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
        if (result.jobListings) {
          setJobListings(result.jobListings);
        }
      }
      return true;
    },
    [],
  );

  const resetAndLoad = useCallback(
    async (jobListingId: string) => {
      setError(null);
      setLoading(true);
      setItems([]);
      setNextCursor(null);
      setHasMore(false);
      await loadPage({ jobListingId: jobListingId || undefined, append: false });
      setLoading(false);
    },
    [loadPage],
  );

  useEffect(() => {
    setSelectedJobId(jobFromUrl);
    void resetAndLoad(jobFromUrl);
  }, [jobFromUrl, resetAndLoad]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(null);
    await loadPage({
      cursor: nextCursor,
      jobListingId: selectedJobId || undefined,
      append: true,
    });
    setLoadingMore(false);
    loadingMoreRef.current = false;
  }, [hasMore, nextCursor, loadPage, selectedJobId]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  function handleJobFilterChange(jobId: string) {
    setSelectedJobId(jobId);
    syncJobInUrl(jobId);
  }

  const totalForFilter = selectedJobId
    ? jobListings.find((j) => j.id === selectedJobId)?.applicantCount
    : jobListings.reduce((sum, j) => sum + j.applicantCount, 0);

  const interviewCount = items.filter((i) => i.status === "INTERVIEW" || i.status === "OFFER").length;

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Pipeline"
        title="Applications"
        subtitle="Review candidates, read cover letters, and message applicants in one place."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total loaded</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {loading ? "…" : items.length}
            {hasMore ? "+" : ""}
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm dark:border-violet-900/40 dark:from-violet-950/30 dark:to-zinc-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400">
            Active pipeline
          </p>
          <p className="mt-1 text-2xl font-bold text-violet-900 dark:text-violet-100">{interviewCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-zinc-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Filter scope
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {totalForFilter ?? "—"}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/70">
        <label
          htmlFor="filter-job-listing"
          className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          Filter by job posting
        </label>
        <select
          id="filter-job-listing"
          value={selectedJobId}
          onChange={(e) => handleJobFilterChange(e.target.value)}
          className={fieldClass}
          disabled={loading && jobListings.length === 0}
        >
          <option value="">All postings{totalForFilter !== undefined ? ` (${totalForFilter})` : ""}</option>
          {jobListings.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} ({job.applicantCount})
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 animate-pulse rounded-3xl border border-zinc-200/60 bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/40"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description={
            selectedJobId
              ? "No one has applied to this posting yet. Share the job link to attract candidates."
              : "When job seekers apply on the board, they appear here with profile and cover letter."
          }
          icon={<ApplicationsIcon />}
          action={
            <LinkButton href="/dashboard/employer/jobs" variant="success" size="md">
              Manage job postings
            </LinkButton>
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((row) => {
              const name = applicantName(row);
              return (
                <li
                  key={row.id}
                  className="group flex flex-col gap-4 rounded-3xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm transition-all hover:border-emerald-300/40 hover:shadow-md sm:flex-row sm:items-center dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:hover:border-emerald-700/40"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <UserAvatar name={name} size="lg" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-50">{name}</p>
                        <StatusBadge status={row.status} />
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                        {row.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {row.user.email}
                        {row.location ? ` · ${row.location}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">Applied {formatDate(row.appliedAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:flex-col sm:items-stretch">
                    <ActionLink
                      href={`/dashboard/employer/applications/${row.id}`}
                      actionVariant="primary"
                      className="min-w-[9rem] justify-center px-4 py-2"
                    >
                      View application
                    </ActionLink>
                    {row.jobListing ? (
                      <ActionLink
                        href={`/jobs/${row.jobListing.id}`}
                        actionVariant="neutral"
                        className="min-w-[9rem] justify-center px-4 py-2"
                      >
                        View posting
                      </ActionLink>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>

          <div ref={loadMoreRef} className="mt-6 flex justify-center py-4">
            {loadingMore ? (
              <p className="text-sm text-zinc-500">Loading more…</p>
            ) : hasMore ? (
              <p className="text-xs text-zinc-400">Scroll for more</p>
            ) : (
              <p className="text-xs text-zinc-400">End of list</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
