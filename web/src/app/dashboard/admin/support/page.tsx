"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import {
  fetchSupportInquiries,
  type SupportInquiryListItem,
  type SupportInquiryStatus,
} from "@/lib/admin-support-api";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function statusBadge(status: SupportInquiryStatus) {
  const open = status === "OPEN";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        open
          ? "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      {open ? "Open" : "Resolved"}
    </span>
  );
}

export default function AdminSupportPage() {
  const [items, setItems] = useState<SupportInquiryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<SupportInquiryStatus | "ALL">("OPEN");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    const result = await fetchSupportInquiries({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      q: query.trim() || undefined,
      limit: 50,
    });
    setLoading(false);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load inquiries");
      return;
    }
    if ("items" in result) {
      setItems(result.items);
    }
  }, [query, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Support inbox</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Messages from the public contact form and signed-in users.
        </p>
      </div>

      <DashboardCard title="Inquiries" accent="violet">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="support-status" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Status
            </label>
            <select
              id="support-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SupportInquiryStatus | "ALL")}
              className="mt-1 block rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ALL">All</option>
            </select>
          </div>
          <div className="min-w-[12rem] flex-1">
            <label htmlFor="support-search" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Search
            </label>
            <input
              id="support-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Email or subject"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => void load()}>
            Refresh
          </Button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        {loading ? (
          <p className="mt-6 text-sm text-zinc-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">No inquiries match this filter.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700">
                  <th className="px-2 py-2 font-semibold">Date</th>
                  <th className="px-2 py-2 font-semibold">From</th>
                  <th className="px-2 py-2 font-semibold">Subject</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-100 dark:border-zinc-800/80">
                    <td className="px-2 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        href={`/dashboard/admin/support/${row.id}`}
                        className="font-medium text-sky-700 hover:underline dark:text-sky-300"
                      >
                        {row.name}
                      </Link>
                      <p className="text-xs text-zinc-500">{row.email}</p>
                    </td>
                    <td className="px-2 py-3">{row.subject}</td>
                    <td className="px-2 py-3">{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
