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

export function SeekerApplicationsList() {
  const [items, setItems] = useState<SeekerApplication[]>([]);
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
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Pipeline"
        title="Applications"
        subtitle="Every role you applied to through huntFlow, with status and company details."
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <LinkButton href="/jobs" variant="success" size="md">
          Browse more jobs
        </LinkButton>
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
            When you apply on the job board, the role appears here automatically.
          </p>
          <LinkButton href="/jobs" variant="emerald" size="lg" className="mt-6">
            Explore open roles
          </LinkButton>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-zinc-200/80 bg-white/90 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200/80 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80">
              <tr>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Applied</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
              {items.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">{row.title}</td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">{row.company.name}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${applicationStatusClass(row.status)}`}
                    >
                      {applicationStatusLabel(row.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-500">{formatDate(row.appliedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {row.jobListing ? (
                        <ActionLink href={`/jobs/${row.jobListing.id}`} actionVariant="link">
                          View posting
                        </ActionLink>
                      ) : (
                        <span className="px-2 text-xs text-zinc-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
