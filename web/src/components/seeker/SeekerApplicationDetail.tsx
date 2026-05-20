"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ApplicationMessagesPanel } from "@/components/applications/ApplicationMessagesPanel";
import { BackLink } from "@/components/dashboard/BackLink";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ActionLink, LinkButton } from "@/components/ui/button";
import {
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
    return (
      <div className="p-8">
        <div className="h-32 animate-pulse rounded-3xl bg-white/60 dark:bg-zinc-900/40" />
      </div>
    );
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

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <BackLink href="/dashboard/seeker/applications">Back to applications</BackLink>

      <div className="mb-8 rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-white via-white to-emerald-50/50 p-6 shadow-sm dark:border-zinc-800/80 dark:from-zinc-900/70 dark:via-zinc-900/70 dark:to-emerald-950/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
              Your application
            </p>
            <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.application.title}</h1>
            {data.jobListing ? (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{data.jobListing.title}</p>
            ) : null}
          </div>
          <StatusBadge status={data.application.status} size="md" />
        </div>
      </div>

      <DashboardTabs
        className="mb-8"
        active={tab}
        onChange={(id) => setTab(id as TabId)}
        tabs={[
          { id: "application", label: "Application" },
          {
            id: "messages",
            label: "Messages",
            badge: data.messaging.messageCount || undefined,
          },
        ]}
      />

      {tab === "application" ? (
        <DashboardCard title="Application details" accent="sky" className="max-w-3xl">
          <p className="text-sm text-zinc-500">Applied {formatDate(data.application.appliedAt)}</p>
          {data.jobListing ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
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
          <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">Cover letter</h4>
          {data.application.coverLetter ? (
            <div className="mt-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {data.application.coverLetter}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No cover letter was included with this application.</p>
          )}
        </DashboardCard>
      ) : null}

      {tab === "messages" ? (
        <ApplicationMessagesPanel applicationId={data.application.id} audience="seeker" active={tab === "messages"} />
      ) : null}
    </div>
  );
}
