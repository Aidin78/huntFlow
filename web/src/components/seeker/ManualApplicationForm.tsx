"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { BackLink } from "@/components/dashboard/BackLink";
import { Button } from "@/components/ui/button";
import { createManualApplication } from "@/lib/seeker-applications-api";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ManualApplicationForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [appliedAt, setAppliedAt] = useState(todayIsoDate);
  const [location, setLocation] = useState("");
  const [salaryText, setSalaryText] = useState("");
  const [notes, setNotes] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result = await createManualApplication({
      companyName: companyName.trim(),
      title: title.trim(),
      appliedAt: appliedAt || undefined,
      location: location.trim() || undefined,
      salaryText: salaryText.trim() || undefined,
      notes: notes.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
    });

    setSaving(false);

    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not create application");
      return;
    }

    if ("application" in result) {
      router.push(`/dashboard/seeker/applications/${result.application.id}`);
    }
  }

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <BackLink href="/dashboard/seeker/applications">Back to applications</BackLink>

      <div className="mb-8">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
          Manual entry
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Add application</h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Track a role you applied to outside huntFlow — LinkedIn, a company site, or a referral.
        </p>
      </div>

      <DashboardCard title="Application details" accent="emerald" className="max-w-2xl">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div>
            <label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Company
            </label>
            <input
              id="companyName"
              required
              maxLength={200}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={fieldClass}
              placeholder="Acme Corp"
            />
          </div>

          <div>
            <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Role title
            </label>
            <input
              id="title"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
              placeholder="Senior Software Engineer"
            />
          </div>

          <div>
            <label htmlFor="appliedAt" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Applied date
            </label>
            <input
              id="appliedAt"
              type="date"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="location" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Location
              </label>
              <input
                id="location"
                maxLength={200}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={fieldClass}
                placeholder="Berlin · Remote"
              />
            </div>
            <div>
              <label htmlFor="salaryText" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Salary (optional)
              </label>
              <input
                id="salaryText"
                maxLength={100}
                value={salaryText}
                onChange={(e) => setSalaryText(e.target.value)}
                className={fieldClass}
                placeholder="€80k–€95k"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sourceUrl" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Job posting URL
            </label>
            <input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className={fieldClass}
              placeholder="https://…"
            />
          </div>

          <div>
            <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              maxLength={4000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={fieldClass}
              placeholder="Recruiter name, referral contact, interview prep…"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" variant="success" disabled={saving}>
              {saving ? "Saving…" : "Add application"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/seeker/applications")}>
              Cancel
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}
