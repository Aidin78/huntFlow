"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardStatCard } from "@/components/dashboard/dashboard-ui";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { CompanyRequiredAlert } from "@/components/employer/CompanyRequiredAlert";
import { JobListingForm } from "@/components/employer/JobListingForm";
import { ActionButton, ActionLink, Button, LinkButton } from "@/components/ui/button";
import { isEmployerCompanyComplete } from "@/lib/employer-company";
import {
  createEmployerJobListing,
  deactivateEmployerJobListing,
  deleteEmployerJobListing,
  type EmployerCompany,
  type EmployerJobListing,
  type JobListingFormInput,
  fetchEmployerJobListings,
  lifecycleBadgeClass,
  lifecycleLabel,
  publishEmployerJobListing,
  updateEmployerJobListing,
} from "@/lib/employer-job-listings-api";
import { workArrangementLabel } from "@/lib/job-listings-api";

type ModalMode = "create" | "edit" | null;

function locationLabel(job: EmployerJobListing): string {
  const parts = [job.city, workArrangementLabel(job.workArrangement)].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function JobsIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.75V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

export function EmployerJobsManager() {
  const [company, setCompany] = useState<EmployerCompany | null>(null);
  const [items, setItems] = useState<EmployerJobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<EmployerJobListing | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchEmployerJobListings();
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load postings");
      setLoading(false);
      return;
    }
    if ("items" in result) {
      setCompany(result.company);
      setItems(result.items);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(data: JobListingFormInput) {
    setActionError(null);
    setSaving(true);
    const result = await createEmployerJobListing(data);
    setSaving(false);
    if ("error" in result && result.error) {
      setActionError(result.error.message ?? "Could not create posting");
      return;
    }
    if ("item" in result) {
      setModal(null);
      await load();
    }
  }

  async function handleUpdate(data: JobListingFormInput) {
    if (!editing) return;
    setActionError(null);
    setSaving(true);
    const result = await updateEmployerJobListing(editing.id, data);
    setSaving(false);
    if ("error" in result && result.error) {
      setActionError(result.error.message ?? "Could not update posting");
      return;
    }
    setModal(null);
    setEditing(null);
    await load();
  }

  async function handleDelete(job: EmployerJobListing) {
    if (job.status !== "DRAFT") return;
    if (!window.confirm(`Delete draft "${job.title}"? This cannot be undone.`)) return;
    setActionError(null);
    const result = await deleteEmployerJobListing(job.id);
    if (result && "error" in result && result.error) {
      setActionError(result.error.message ?? "Could not delete");
      return;
    }
    await load();
  }

  async function handlePublish(job: EmployerJobListing) {
    setActionError(null);
    const result = await publishEmployerJobListing(job.id);
    if ("error" in result && result.error) {
      setActionError(result.error.message ?? "Could not publish");
      return;
    }
    await load();
  }

  async function handleDeactivate(job: EmployerJobListing) {
    if (!window.confirm(`Deactivate "${job.title}"? It will be hidden from the job board.`)) return;
    setActionError(null);
    const result = await deactivateEmployerJobListing(job.id);
    if ("error" in result && result.error) {
      setActionError(result.error.message ?? "Could not deactivate");
      return;
    }
    await load();
  }

  const companyComplete = isEmployerCompanyComplete(company);
  const published = items.filter((j) => j.status === "PUBLISHED").length;
  const drafts = items.filter((j) => j.status === "DRAFT").length;
  const totalApplicants = items.reduce((s, j) => s + j.applicantCount, 0);

  function openCreate() {
    if (!companyComplete) return;
    setEditing(null);
    setModal("create");
    setActionError(null);
  }

  function openEdit(job: EmployerJobListing) {
    setEditing(job);
    setModal("edit");
    setActionError(null);
  }

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Hiring"
        title="Job postings"
        subtitle="Create drafts, publish to the job board, and deactivate roles when hiring closes."
        actions={
          <Button
            type="button"
            variant="success"
            onClick={openCreate}
            disabled={!companyComplete}
            title={!companyComplete ? "Complete your company profile first" : undefined}
          >
            + New posting
          </Button>
        }
      />

      {error ? (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {actionError ? (
        <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {actionError}
        </p>
      ) : null}

      {!companyComplete ? (
        <CompanyRequiredAlert company={company} returnTo="/dashboard/employer/jobs" />
      ) : company ? (
        <p className="mb-6 rounded-xl border border-sky-200/60 bg-sky-50/50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200">
          Posting as <span className="font-semibold">{company.name}</span>
        </p>
      ) : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <DashboardStatCard label="Published" value={loading ? "…" : String(published)} tone="emerald" />
        <DashboardStatCard label="Drafts" value={loading ? "…" : String(drafts)} tone="amber" />
        <DashboardStatCard label="Total applicants" value={loading ? "…" : String(totalApplicants)} tone="violet" />
      </div>

      <div className="mb-6">
        <LinkButton href="/jobs" variant="secondary" size="sm">
          View public job board
        </LinkButton>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 animate-pulse rounded-3xl bg-white/60 dark:bg-zinc-900/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No postings yet"
          description="Create a draft, then publish when you are ready to receive applications."
          icon={<JobsIcon />}
          action={
            <Button type="button" variant="success" onClick={openCreate} disabled={!companyComplete}>
              Create first posting
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {items.map((job) => (
            <li
              key={job.id}
              className="rounded-3xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm transition-all hover:border-sky-300/40 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:hover:border-sky-700/40"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{job.title}</h3>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${lifecycleBadgeClass(job.status)}`}
                    >
                      {lifecycleLabel(job.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{locationLabel(job)}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                    <span>
                      Applicants:{" "}
                      {job.applicantCount > 0 ? (
                        <ActionLink
                          href={`/dashboard/employer/applications?job=${encodeURIComponent(job.id)}`}
                          actionVariant="link"
                          className="inline px-1 py-0"
                        >
                          {job.applicantCount}
                        </ActionLink>
                      ) : (
                        "0"
                      )}
                    </span>
                    <span>Published {formatDate(job.publishedAt)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
                  <ActionButton type="button" onClick={() => openEdit(job)}>
                    Edit
                  </ActionButton>
                  {job.status === "DRAFT" ? (
                    <>
                      <ActionButton type="button" actionVariant="primary" onClick={() => void handlePublish(job)}>
                        Publish
                      </ActionButton>
                      <ActionButton type="button" actionVariant="danger" onClick={() => void handleDelete(job)}>
                        Delete
                      </ActionButton>
                    </>
                  ) : null}
                  {job.status === "PUBLISHED" ? (
                    <>
                      <ActionButton type="button" onClick={() => void handleDeactivate(job)}>
                        Deactivate
                      </ActionButton>
                      <ActionLink href={`/jobs/${job.id}`} actionVariant="link">
                        View live
                      </ActionLink>
                    </>
                  ) : null}
                  {job.status === "DEACTIVATED" ? (
                    <ActionButton type="button" actionVariant="primary" onClick={() => void handlePublish(job)}>
                      Republish
                    </ActionButton>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="listing-modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h2 id="listing-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {modal === "create" ? "New job posting" : "Edit job posting"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {modal === "create"
                ? "Saved as a draft until you publish."
                : "Changes apply immediately; published listings stay on the board unless deactivated."}
            </p>
            <div className="mt-6">
              <JobListingForm
                initial={
                  editing
                    ? {
                        title: editing.title,
                        summary: editing.summary ?? undefined,
                        city: editing.city ?? undefined,
                        workArrangement: editing.workArrangement,
                        experienceLevel: editing.experienceLevel,
                        salaryText: editing.salaryText ?? undefined,
                        sourceUrl: editing.sourceUrl ?? undefined,
                      }
                    : undefined
                }
                submitLabel={modal === "create" ? "Save draft" : "Save changes"}
                loading={saving}
                onCancel={() => {
                  setModal(null);
                  setEditing(null);
                }}
                onSubmit={modal === "create" ? handleCreate : handleUpdate}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
