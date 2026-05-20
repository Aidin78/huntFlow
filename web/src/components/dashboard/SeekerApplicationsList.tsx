"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ActionLink, LinkButton } from "@/components/ui/button";
import {
  fetchSeekerApplications,
  type JobApplicationStatus,
  type SeekerApplication,
} from "@/lib/seeker-applications-api";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function PipelineIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
      />
    </svg>
  );
}

const STATUS_FILTERS: { id: "all" | JobApplicationStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "APPLIED", label: "Applied" },
  { id: "INTERVIEW", label: "Interview" },
  { id: "OFFER", label: "Offer" },
  { id: "REJECTED", label: "Rejected" },
];

export function SeekerApplicationsList() {
  const [items, setItems] = useState<SeekerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | JobApplicationStatus>("all");

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchSeekerApplications();
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load applications");
      setLoading(false);
      return;
    }
    if ("items" in result) {
      setItems(result.items);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => (statusFilter === "all" ? items : items.filter((i) => i.status === statusFilter)),
    [items, statusFilter],
  );

  const activeCount = items.filter((i) => i.status === "INTERVIEW" || i.status === "OFFER").length;

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Pipeline"
        title="Applications"
        subtitle="Track every role you applied to — status, messages, and cover letters in one place."
        actions={
          <LinkButton href="/jobs" variant="success" size="md">
            Browse jobs
          </LinkButton>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-zinc-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Total applications
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {loading ? "…" : items.length}
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm dark:border-violet-900/40 dark:from-violet-950/30 dark:to-zinc-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400">
            In progress
          </p>
          <p className="mt-1 text-2xl font-bold text-violet-900 dark:text-violet-100">{activeCount}</p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => {
            const count =
              f.id === "all" ? items.length : items.filter((i) => i.status === f.id).length;
            if (f.id !== "all" && count === 0) return null;
            const active = statusFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                {f.label}
                <span className={active ? "text-emerald-100" : "text-zinc-400"}>{count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

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
              className="h-28 animate-pulse rounded-3xl border border-zinc-200/60 bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/40"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? "No applications yet" : "No matches"}
          description={
            items.length === 0
              ? "When you apply on the job board, the role appears here automatically."
              : "Try a different status filter to see more applications."
          }
          icon={<PipelineIcon />}
          action={
            items.length === 0 ? (
              <LinkButton href="/jobs" variant="emerald" size="lg">
                Explore open roles
              </LinkButton>
            ) : (
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
              >
                Clear filter
              </button>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-4 rounded-3xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm transition-all hover:border-sky-300/40 hover:shadow-md sm:flex-row sm:items-center dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:hover:border-sky-700/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{row.title}</p>
                  <StatusBadge status={row.status} />
                </div>
                <p className="mt-1 text-sm font-medium text-sky-800 dark:text-sky-300">{row.company.name}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  Applied {formatDate(row.appliedAt)}
                  {row.location ? ` · ${row.location}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
                <ActionLink
                  href={`/dashboard/seeker/applications/${row.id}`}
                  actionVariant="primary"
                  className="min-w-[8rem] justify-center px-4 py-2"
                >
                  Open
                </ActionLink>
                {row.jobListing ? (
                  <ActionLink
                    href={`/jobs/${row.jobListing.id}`}
                    actionVariant="neutral"
                    className="min-w-[8rem] justify-center px-4 py-2"
                  >
                    View posting
                  </ActionLink>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
