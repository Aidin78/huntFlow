"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { JobListingFormInput } from "@/lib/employer-job-listings-api";
import type { ExperienceLevel, WorkArrangement } from "@/lib/job-listings-api";
import { experienceLabel, workArrangementLabel } from "@/lib/job-listings-api";

const fieldClass =
  "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

type JobListingFormProps = {
  initial?: Partial<JobListingFormInput>;
  onSubmit: (data: JobListingFormInput) => void | Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  loading?: boolean;
};

const defaultValues: JobListingFormInput = {
  title: "",
  summary: "",
  city: "",
  workArrangement: "HYBRID",
  experienceLevel: "MID",
  salaryText: "",
  sourceUrl: "",
};

export function JobListingForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  loading = false,
}: JobListingFormProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: JobListingFormInput = {
      title: String(fd.get("title") ?? "").trim(),
      summary: String(fd.get("summary") ?? "").trim() || undefined,
      city: String(fd.get("city") ?? "").trim() || undefined,
      workArrangement: String(fd.get("workArrangement")) as WorkArrangement,
      experienceLevel: String(fd.get("experienceLevel")) as ExperienceLevel,
      salaryText: String(fd.get("salaryText") ?? "").trim() || undefined,
      sourceUrl: String(fd.get("sourceUrl") ?? "").trim() || undefined,
    };
    void onSubmit(data);
  }

  const v = { ...defaultValues, ...initial };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Job title *
        </label>
        <input id="title" name="title" required defaultValue={v.title} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="summary" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={4}
          defaultValue={v.summary ?? ""}
          className={fieldClass}
          placeholder="Role overview, team, requirements…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            City
          </label>
          <input id="city" name="city" defaultValue={v.city ?? ""} className={fieldClass} placeholder="e.g. Berlin" />
        </div>
        <div>
          <label htmlFor="salaryText" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Compensation
          </label>
          <input
            id="salaryText"
            name="salaryText"
            defaultValue={v.salaryText ?? ""}
            className={fieldClass}
            placeholder="e.g. €70k–€90k"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="workArrangement" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Work arrangement
          </label>
          <select
            id="workArrangement"
            name="workArrangement"
            defaultValue={v.workArrangement}
            className={fieldClass}
          >
            {(["REMOTE", "HYBRID", "ONSITE"] as WorkArrangement[]).map((wa) => (
              <option key={wa} value={wa}>
                {workArrangementLabel(wa)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="experienceLevel" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Experience
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            defaultValue={v.experienceLevel}
            className={fieldClass}
          >
            {(["INTERN", "ENTRY", "MID", "SENIOR", "LEAD"] as ExperienceLevel[]).map((ex) => (
              <option key={ex} value={ex}>
                {experienceLabel(ex)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="sourceUrl" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          External apply URL
        </label>
        <input
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          defaultValue={v.sourceUrl ?? ""}
          className={fieldClass}
          placeholder="https://…"
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
