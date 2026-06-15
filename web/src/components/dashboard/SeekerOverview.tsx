"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardStatCard } from "@/components/dashboard/dashboard-ui";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ActionLink, LinkButton } from "@/components/ui/button";
import { fetchSeekerApplications, type SeekerApplication } from "@/lib/seeker-applications-api";
import { fetchSeekerUpcoming, formatScheduleDateTime, type UpcomingItem } from "@/lib/seeker-schedule-api";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function SeekerOverview() {
  const [items, setItems] = useState<SeekerApplication[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [appsResult, upcomingResult] = await Promise.all([
      fetchSeekerApplications(),
      fetchSeekerUpcoming(5),
    ]);
    if ("error" in appsResult && appsResult.error) {
      setError(appsResult.error.message ?? "Could not load applications");
      setLoading(false);
      return;
    }
    if ("items" in appsResult) {
      setItems(appsResult.items);
      setCounts(appsResult.statusCounts);
    }
    if ("items" in upcomingResult) {
      setUpcoming(upcomingResult.items);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const active = items.filter((a) => a.status !== "ARCHIVED" && a.status !== "REJECTED").length;
  const interviews = counts.INTERVIEW ?? 0;
  const offers = counts.OFFER ?? 0;

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Job seeker"
        title="Your job search"
        subtitle="Track applications you submit on huntFlow and discover new roles on the board."
        actions={
          <LinkButton href="/jobs" variant="success" size="md">
            Browse jobs
          </LinkButton>
        }
      />

      {error ? (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label="Active applications" value={loading ? "…" : String(active)} tone="emerald" />
        <DashboardStatCard label="Interviews" value={loading ? "…" : String(interviews)} tone="violet" />
        <DashboardStatCard label="Offers" value={loading ? "…" : String(offers)} tone="sky" />
        <DashboardStatCard label="Total tracked" value={loading ? "…" : String(items.length)} tone="default" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/jobs" variant="success" size="md">
          Browse open jobs
        </LinkButton>
        <LinkButton href="/dashboard/seeker/applications" variant="secondary" size="md">
          View all applications
        </LinkButton>
        <LinkButton href="/dashboard/seeker/settings" variant="secondary" size="md">
          Edit profile
        </LinkButton>
      </div>

      <DashboardCard title="Upcoming" accent="violet" className="mt-10">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-14 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            title="Nothing scheduled"
            description="Add interviews or reminders on an application to see them here."
            action={
              <LinkButton href="/dashboard/seeker/applications" variant="secondary" size="md">
                Go to applications
              </LinkButton>
            }
          />
        ) : (
          <ul className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {upcoming.map((row) => (
              <li
                key={`${row.kind}-${row.id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${
                        row.kind === "interview"
                          ? "bg-violet-500/12 text-violet-800 dark:text-violet-200"
                          : "bg-amber-500/12 text-amber-800 dark:text-amber-200"
                      }`}
                    >
                      {row.kind === "interview" ? "Interview" : "Reminder"}
                    </span>
                    {row.isOverdue ? (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-red-700 dark:text-red-300">
                        Overdue
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">{row.title}</p>
                  <p className="text-sm text-sky-800 dark:text-sky-300">
                    {row.applicationTitle} · {row.companyName}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">{formatScheduleDateTime(row.at)}</p>
                </div>
                <ActionLink
                  href={`/dashboard/seeker/applications/${row.applicationId}`}
                  actionVariant="primary"
                  className="px-3 py-1.5"
                >
                  Open
                </ActionLink>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      <DashboardCard title="Recent applications" accent="emerald" className="mt-10">
        <div className="mb-4 flex justify-end">
          <LinkButton href="/dashboard/seeker/applications" variant="link" size="sm">
            View all →
          </LinkButton>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Apply to a role on the job board to start tracking it here."
            action={
              <LinkButton href="/jobs" variant="emerald" size="md">
                Find roles
              </LinkButton>
            }
          />
        ) : (
          <ul className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {items.slice(0, 5).map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.title}</p>
                  <p className="text-sm text-sky-800 dark:text-sky-300">{row.company.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {row.appliedAt ? `Applied ${formatDate(row.appliedAt)}` : "—"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={row.status} />
                  <ActionLink
                    href={`/dashboard/seeker/applications/${row.id}`}
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
  );
}
