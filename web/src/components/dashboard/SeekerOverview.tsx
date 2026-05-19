"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { ActionLink, LinkButton } from "@/components/ui/button";
import {
  applicationStatusClass,
  applicationStatusLabel,
  fetchSeekerApplications,
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

export function SeekerOverview() {
  const [items, setItems] = useState<SeekerApplication[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setCounts(result.statusCounts);
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
      />

      {error ? (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active applications", value: loading ? "…" : String(active) },
          { label: "Interviews", value: loading ? "…" : String(interviews) },
          { label: "Offers", value: loading ? "…" : String(offers) },
          { label: "Total tracked", value: loading ? "…" : String(items.length) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/60"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/jobs" variant="success" size="md">
          Browse open jobs
        </LinkButton>
        <LinkButton href="/dashboard/seeker/applications" variant="secondary" size="md">
          View all applications
        </LinkButton>
      </div>

      <section className="mt-10 rounded-3xl border border-zinc-200/80 bg-white/90 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent applications</h2>
          <LinkButton href="/dashboard/seeker/applications" variant="link" size="sm">
            View all
          </LinkButton>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-zinc-500">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">No applications yet</p>
            <p className="mt-2 text-sm text-zinc-500">Apply to a role on the job board to start tracking it here.</p>
            <LinkButton href="/jobs" variant="emerald" size="md" className="mt-5">
              Find roles
            </LinkButton>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {items.slice(0, 5).map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{row.title}</p>
                  <p className="text-xs text-zinc-500">
                    {row.company.name}
                    {row.appliedAt ? ` · Applied ${formatDate(row.appliedAt)}` : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${applicationStatusClass(row.status)}`}
                  >
                    {applicationStatusLabel(row.status)}
                  </span>
                  {row.jobListing ? (
                    <ActionLink href={`/jobs/${row.jobListing.id}`} actionVariant="link">
                      View job
                    </ActionLink>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
