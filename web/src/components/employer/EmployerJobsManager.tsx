"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { CompanyRequiredAlert } from "@/components/employer/CompanyRequiredAlert";
import { JobListingForm } from "@/components/employer/JobListingForm";
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
        subtitle="Create drafts, publish to the job board, and deactivate roles when hiring closes. Published postings cannot be deleted."
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
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Posting as <span className="font-semibold text-zinc-900 dark:text-zinc-100">{company.name}</span>
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openCreate}
          disabled={!companyComplete}
          title={!companyComplete ? "Complete your company profile first" : undefined}
          className="inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          + New posting
        </button>
        <Link
          href="/jobs"
          className="inline-flex rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
        >
          View public job board
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading postings…</p>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 px-8 py-14 text-center dark:border-zinc-700">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">No postings yet</p>
          <p className="mt-2 text-sm text-zinc-500">Create a draft, then publish when you are ready.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-zinc-200/80 bg-white/90 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200/80 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80">
              <tr>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Applicants</th>
                <th className="px-5 py-3">Published</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
              {items.map((job) => (
                <tr key={job.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">{job.title}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${lifecycleBadgeClass(job.status)}`}
                    >
                      {lifecycleLabel(job.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">{locationLabel(job)}</td>
                  <td className="px-5 py-4 tabular-nums">{job.applicantCount}</td>
                  <td className="px-5 py-4 text-zinc-500">{formatDate(job.publishedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(job)}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Edit
                      </button>
                      {job.status === "DRAFT" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handlePublish(job)}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            Publish
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(job)}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            Delete
                          </button>
                        </>
                      ) : null}
                      {job.status === "PUBLISHED" ? (
                        <button
                          type="button"
                          onClick={() => void handleDeactivate(job)}
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300"
                        >
                          Deactivate
                        </button>
                      ) : null}
                      {job.status === "DEACTIVATED" ? (
                        <button
                          type="button"
                          onClick={() => void handlePublish(job)}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                        >
                          Republish
                        </button>
                      ) : null}
                      {job.status === "PUBLISHED" ? (
                        <Link
                          href={`/jobs/${job.id}`}
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-400"
                        >
                          View live
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
