"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ApplicationResumePanel } from "@/components/applications/ApplicationResumePanel";
import { ApplicationAttachmentsPanel } from "@/components/applications/ApplicationAttachmentsPanel";
import { ApplicationContactsPanel } from "@/components/applications/ApplicationContactsPanel";
import { ApplicationLinksPanel } from "@/components/applications/ApplicationLinksPanel";
import { ApplicationInterviewsPanel } from "@/components/applications/ApplicationInterviewsPanel";
import { ApplicationMessagesPanel } from "@/components/applications/ApplicationMessagesPanel";
import { ApplicationRemindersPanel } from "@/components/applications/ApplicationRemindersPanel";
import { ApplicationTagsPanel } from "@/components/applications/ApplicationTagsPanel";
import { ApplicationStatusHistory } from "@/components/applications/ApplicationStatusHistory";
import { SeekerApplicationStatusControl } from "@/components/applications/SeekerApplicationStatusControl";
import { BackLink } from "@/components/dashboard/BackLink";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ActionLink, Button, LinkButton } from "@/components/ui/button";
import {
  archiveSeekerApplication,
  fetchSeekerApplicationDetail,
  updateManualApplication,
  type JobApplicationStatus,
  type SeekerApplicationDetailResponse,
} from "@/lib/seeker-applications-api";
import { workArrangementLabel } from "@/lib/job-listings-api";

type TabId = "application" | "messages";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

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

function appliedDateInput(iso: string | null): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return iso.slice(0, 10);
}

export function SeekerApplicationDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [data, setData] = useState<SeekerApplicationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("application");
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    companyName: "",
    appliedAt: "",
    location: "",
    salaryText: "",
    notes: "",
    sourceUrl: "",
  });

  const isManual = data?.application.isManual ?? false;

  useEffect(() => {
    if (searchParams.get("tab") === "messages" && !isManual) {
      setTab("messages");
    }
  }, [searchParams, isManual]);

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
      setEditForm({
        title: result.application.title,
        companyName: result.company?.name ?? "",
        appliedAt: appliedDateInput(result.application.appliedAt),
        location: result.application.location ?? "",
        salaryText: result.application.salaryText ?? "",
        notes: result.application.notes ?? "",
        sourceUrl: result.sourceUrl ?? "",
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleStatusUpdated(status: JobApplicationStatus, event: SeekerApplicationDetailResponse["statusHistory"][number]) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            application: {
              ...prev.application,
              status,
              updatedAt: new Date().toISOString(),
            },
            statusHistory: [event, ...prev.statusHistory],
          }
        : prev,
    );
  }

  async function handleArchive() {
    if (!data || data.application.status === "ARCHIVED") return;
    if (!window.confirm("Archive this application? You can still view it later from your list.")) return;

    setArchiving(true);
    setArchiveError(null);
    const result = await archiveSeekerApplication(data.application.id);
    setArchiving(false);

    if ("error" in result && result.error) {
      setArchiveError(result.error.message ?? "Could not archive application");
      return;
    }

    if ("application" in result) {
      handleStatusUpdated(result.application.status, result.event);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSavingEdit(true);
    setEditError(null);

    const result = await updateManualApplication(data.application.id, {
      title: editForm.title.trim(),
      companyName: editForm.companyName.trim(),
      appliedAt: editForm.appliedAt || null,
      location: editForm.location.trim() || null,
      salaryText: editForm.salaryText.trim() || null,
      notes: editForm.notes.trim() || null,
      sourceUrl: editForm.sourceUrl.trim() || null,
    });

    setSavingEdit(false);

    if ("error" in result && result.error) {
      setEditError(result.error.message ?? "Could not save changes");
      return;
    }

    setEditing(false);
    setLoading(true);
    await load();
  }

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

  const tabs = isManual
    ? [{ id: "application" as const, label: "Application" }]
    : [
        { id: "application" as const, label: "Application" },
        {
          id: "messages" as const,
          label: "Messages",
          badge: data.messaging.messageCount || undefined,
        },
      ];

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <BackLink href="/dashboard/seeker/applications">Back to applications</BackLink>

      <div className="mb-8 rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-white via-white to-emerald-50/50 p-6 shadow-sm dark:border-zinc-800/80 dark:from-zinc-900/70 dark:via-zinc-900/70 dark:to-emerald-950/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
              {isManual ? "Manual application" : "Your application"}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.application.title}</h1>
            {data.company ? (
              <p className="mt-1 text-sm font-medium text-sky-800 dark:text-sky-300">{data.company.name}</p>
            ) : null}
            {data.jobListing ? (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{data.jobListing.title}</p>
            ) : null}
          </div>
          <StatusBadge status={data.application.status} size="md" />
        </div>
        {isManual ? (
          <SeekerApplicationStatusControl
            applicationId={data.application.id}
            currentStatus={data.application.status}
            onUpdated={handleStatusUpdated}
          />
        ) : data.application.status !== "ARCHIVED" ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={archiving}
            onClick={() => void handleArchive()}
            className="mt-4"
          >
            {archiving ? "Archiving…" : "Archive application"}
          </Button>
        ) : null}
      </div>
      {archiveError ? (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">{archiveError}</p>
      ) : null}

      <DashboardTabs
        className="mb-8"
        active={tab}
        onChange={(id) => setTab(id as TabId)}
        tabs={tabs}
      />

      {tab === "application" ? (
        <DashboardCard title="Application details" accent="sky" className="max-w-3xl">
          {isManual ? (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">You added this application manually.</p>
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing((v) => !v)}>
                {editing ? "Cancel edit" : "Edit details"}
              </Button>
            </div>
          ) : null}

          {isManual && editing ? (
            <form onSubmit={(e) => void handleSaveEdit(e)} className="mb-8 space-y-4 border-b border-zinc-200 pb-8 dark:border-zinc-700">
              <div>
                <label htmlFor="edit-title" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Role title
                </label>
                <input
                  id="edit-title"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="edit-company" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Company
                </label>
                <input
                  id="edit-company"
                  required
                  value={editForm.companyName}
                  onChange={(e) => setEditForm((f) => ({ ...f, companyName: e.target.value }))}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="edit-applied" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Applied date
                </label>
                <input
                  id="edit-applied"
                  type="date"
                  value={editForm.appliedAt}
                  onChange={(e) => setEditForm((f) => ({ ...f, appliedAt: e.target.value }))}
                  className={fieldClass}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-location" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Location
                  </label>
                  <input
                    id="edit-location"
                    value={editForm.location}
                    onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="edit-salary" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Salary
                  </label>
                  <input
                    id="edit-salary"
                    value={editForm.salaryText}
                    onChange={(e) => setEditForm((f) => ({ ...f, salaryText: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="edit-url" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Job posting URL
                </label>
                <input
                  id="edit-url"
                  type="url"
                  value={editForm.sourceUrl}
                  onChange={(e) => setEditForm((f) => ({ ...f, sourceUrl: e.target.value }))}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="edit-notes" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Notes
                </label>
                <textarea
                  id="edit-notes"
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  className={fieldClass}
                />
              </div>
              {editError ? <p className="text-sm text-red-600 dark:text-red-400">{editError}</p> : null}
              <Button type="submit" variant="success" size="sm" disabled={savingEdit}>
                {savingEdit ? "Saving…" : "Save changes"}
              </Button>
            </form>
          ) : null}

          <p className="text-sm text-zinc-500">Applied {formatDate(data.application.appliedAt)}</p>
          {data.application.location ? (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{data.application.location}</p>
          ) : null}
          {data.application.salaryText ? (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{data.application.salaryText}</p>
          ) : null}

          {isManual && data.sourceUrl ? (
            <p className="mt-4 text-sm">
              <span className="text-zinc-500">Posting: </span>
              <a
                href={data.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
              >
                View job posting
              </a>
            </p>
          ) : null}

          {isManual && data.application.notes ? (
            <>
              <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">Notes</h4>
              <div className="mt-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {data.application.notes}
                </p>
              </div>
            </>
          ) : null}

          <div className="mt-8">
            <ApplicationTagsPanel
              applicationId={data.application.id}
              initialTags={data.tags}
            />
          </div>

          <ApplicationResumePanel applicationId={data.application.id} initialResume={data.resume} />
          <ApplicationContactsPanel applicationId={data.application.id} />
          <ApplicationLinksPanel applicationId={data.application.id} initialItems={data.links} />
          <ApplicationAttachmentsPanel applicationId={data.application.id} />

          <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">Status history</h4>
          <ApplicationStatusHistory events={data.statusHistory} className="mt-3 space-y-3" />

          <ApplicationInterviewsPanel applicationId={data.application.id} />
          <ApplicationRemindersPanel applicationId={data.application.id} />

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
          {!isManual ? (
            <>
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
            </>
          ) : null}
        </DashboardCard>
      ) : null}

      {tab === "messages" && !isManual ? (
        <ApplicationMessagesPanel applicationId={data.application.id} audience="seeker" active={tab === "messages"} />
      ) : null}
    </div>
  );
}
