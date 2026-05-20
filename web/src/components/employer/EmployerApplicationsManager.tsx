"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { ActionLink } from "@/components/ui/button";
import {
  applicationStatusClass,
  applicationStatusLabel,
  fetchEmployerApplications,
  type EmployerApplication,
  type EmployerApplicationJobOption,
} from "@/lib/employer-applications-api";

const PAGE_SIZE = 10;

const fieldClass =
  "mt-1.5 w-full max-w-md rounded-2xl border border-zinc-200/90 bg-white/90 px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-50";

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
      const ok = await loadPage({ jobListingId: jobListingId || undefined, append: false });
      setLoading(false);
      return ok;
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

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Pipeline"
        title="Applications"
        subtitle="Candidates who applied to your job postings via huntFlow."
      />

      <div className="mb-8 max-w-2xl">
        <label
          htmlFor="filter-job-listing"
          className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mr-3"
        >
          Job posting
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
        <p className="text-sm text-zinc-500">Loading applications…</p>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 px-8 py-14 text-center dark:border-zinc-700">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">No applications yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
            {selectedJobId
              ? "No one has applied to this posting yet."
              : "When job seekers apply on the board, they appear here."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{items.length}</span>
            {hasMore ? "+" : ""} application{items.length === 1 ? "" : "s"}
          </p>

          <ul className="space-y-3">
            {items.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800/80 dark:bg-zinc-900/60"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{applicantName(row)}</p>
                  <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{row.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {row.user.email}
                    {row.location ? ` · ${row.location}` : ""}
                    {" · Applied "}
                    {formatDate(row.appliedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${applicationStatusClass(row.status)}`}
                  >
                    {applicationStatusLabel(row.status)}
                  </span>
                  <ActionLink
                    href={`/dashboard/employer/applications/${row.id}`}
                    actionVariant="link"
                  >
                    View application
                  </ActionLink>
                  {row.jobListing ? (
                    <ActionLink href={`/jobs/${row.jobListing.id}`} actionVariant="link">
                      View posting
                    </ActionLink>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <div ref={loadMoreRef} className="mt-6 flex justify-center py-4">
            {loadingMore ? (
              <p className="text-sm text-zinc-500">Loading more…</p>
            ) : hasMore ? (
              <p className="text-xs text-zinc-400">Scroll for more</p>
            ) : items.length > 0 ? (
              <p className="text-xs text-zinc-400">End of list</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
