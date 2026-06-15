"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardStatCard } from "@/components/dashboard/dashboard-ui";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ActionLink, LinkButton } from "@/components/ui/button";
import {
  fetchEmployerOverview,
  type EmployerOverviewApplication,
  type EmployerOverviewPosting,
  type EmployerOverviewResponse,
} from "@/lib/employer-overview-api";
import { lifecycleLabel } from "@/lib/employer-job-listings-api";

function lifecycleBadgeClass(status: EmployerOverviewPosting["status"]): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-500/12 text-emerald-800 ring-emerald-500/20 dark:text-emerald-200";
    case "DRAFT":
      return "bg-amber-500/12 text-amber-900 ring-amber-500/20 dark:text-amber-200";
    default:
      return "bg-zinc-500/10 text-zinc-600 ring-zinc-500/15 dark:text-zinc-300";
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function applicantName(row: EmployerOverviewApplication): string {
  return row.applicant.name?.trim() || row.applicant.email;
}

export function EmployerOverview() {
  const [data, setData] = useState<EmployerOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchEmployerOverview();
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load overview");
      setLoading(false);
      return;
    }
    if ("stats" in result) {
      setData(result);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = data?.stats;

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Employer"
        title="Employer overview"
        subtitle="Live hiring metrics and recent activity from your company on huntFlow."
        actions={
          <LinkButton href="/dashboard/employer/jobs" variant="success" size="md">
            New posting
          </LinkButton>
        }
      />

      {error ? (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Active postings"
          value={loading ? "…" : String(stats?.publishedPostings ?? 0)}
          hint={stats?.draftPostings ? `${stats.draftPostings} draft` : undefined}
          tone="emerald"
        />
        <DashboardStatCard
          label="Awaiting review"
          value={loading ? "…" : String(stats?.awaitingReview ?? 0)}
          hint="New applications"
          tone="sky"
        />
        <DashboardStatCard
          label="In pipeline"
          value={loading ? "…" : String(stats?.inPipeline ?? 0)}
          hint="Interview or offer"
          tone="violet"
        />
        <DashboardStatCard
          label="Total applicants"
          value={loading ? "…" : String(stats?.totalApplications ?? 0)}
          tone="amber"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/dashboard/employer/jobs" variant="success" size="md">
          Post a new role
        </LinkButton>
        <LinkButton href="/dashboard/employer/applications" variant="secondary" size="md">
          Review applications
        </LinkButton>
        <LinkButton href="/dashboard/employer/company" variant="secondary" size="md">
          Edit company profile
        </LinkButton>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Recent postings" accent="sky">
          <div className="mb-4 flex justify-end">
            <LinkButton href="/dashboard/employer/jobs" variant="link" size="sm">
              View all →
            </LinkButton>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
              ))}
            </div>
          ) : !data?.recentPostings.length ? (
            <EmptyState
              title="No postings yet"
              description="Create a draft job posting to start receiving applications."
              action={
                <LinkButton href="/dashboard/employer/jobs" variant="success" size="md">
                  Create posting
                </LinkButton>
              }
            />
          ) : (
            <ul className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
              {data.recentPostings.map((job) => (
                <li key={job.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{job.title}</p>
                    <p className="text-xs text-zinc-500">
                      {job.location ?? "—"} · {job.applicantCount} applicant
                      {job.applicantCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${lifecycleBadgeClass(job.status)}`}
                  >
                    {lifecycleLabel(job.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Latest applications" accent="emerald">
          <div className="mb-4 flex justify-end">
            <LinkButton href="/dashboard/employer/applications" variant="link" size="sm">
              View all →
            </LinkButton>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
              ))}
            </div>
          ) : !data?.recentApplications.length ? (
            <EmptyState
              title="No applications yet"
              description="Publish a role on the job board to start receiving candidates."
            />
          ) : (
            <ul className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
              {data.recentApplications.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{applicantName(row)}</p>
                    <p className="text-xs text-zinc-500">{row.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">Applied {formatDate(row.appliedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={row.status} />
                    <ActionLink
                      href={`/dashboard/employer/applications/${row.id}`}
                      actionVariant="primary"
                      className="px-3 py-1.5"
                    >
                      Open
                    </ActionLink>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
