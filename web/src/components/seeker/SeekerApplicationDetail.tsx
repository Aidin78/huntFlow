"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ApplicationMessagesPanel } from "@/components/applications/ApplicationMessagesPanel";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { ActionLink, LinkButton } from "@/components/ui/button";
import {
  applicationStatusClass,
  applicationStatusLabel,
  fetchSeekerApplicationDetail,
  type SeekerApplicationDetailResponse,
} from "@/lib/seeker-applications-api";
import { workArrangementLabel } from "@/lib/job-listings-api";

type TabId = "application" | "messages";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export function SeekerApplicationDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [data, setData] = useState<SeekerApplicationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("application");

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    const result = await fetchSeekerApplicationDetail(id);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load application");
      setLoading(false);
      return;
    }
    if ("application" in result) {
      setData(result);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="p-8 text-sm text-zinc-500">Loading application…</p>;
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? "Application not found"}</p>
        <LinkButton href="/dashboard/seeker/applications" variant="secondary" className="mt-4">
          Back to applications
        </LinkButton>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "application", label: "Application" },
    {
      id: "messages",
      label: `Messages${data.messaging.messageCount ? ` (${data.messaging.messageCount})` : ""}`,
    },
  ];

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <Link
        href="/dashboard/seeker/applications"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to applications
      </Link>

      <DashboardPageHeader
        badge="Application"
        title={data.application.title}
        subtitle={data.jobListing ? data.jobListing.title : "Your pipeline entry"}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "application" ? (
        <section className="max-w-3xl rounded-3xl border border-zinc-200/80 bg-white/90 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${applicationStatusClass(data.application.status)}`}
            >
              {applicationStatusLabel(data.application.status)}
            </span>
            <span className="text-sm text-zinc-500">Applied {formatDate(data.application.appliedAt)}</span>
          </div>
          {data.jobListing ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Posting:{" "}
              <ActionLink href={`/jobs/${data.jobListing.id}`} actionVariant="link">
                {data.jobListing.title}
              </ActionLink>
              {data.jobListing.city ? ` · ${data.jobListing.city}` : ""}
              {" · "}
              {workArrangementLabel(
                data.jobListing.workArrangement as "REMOTE" | "HYBRID" | "ONSITE",
              )}
            </p>
          ) : null}
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-500">Cover letter</h3>
          {data.application.coverLetter ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
              {data.application.coverLetter}
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No cover letter was included with this application.</p>
          )}
        </section>
      ) : null}

      {tab === "messages" ? (
        <ApplicationMessagesPanel applicationId={data.application.id} audience="seeker" active={tab === "messages"} />
      ) : null}
    </div>
  );
}
