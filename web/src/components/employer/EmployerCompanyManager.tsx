"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { EmployerCompanyForm } from "@/components/employer/EmployerCompanyForm";
import { companyProfileChecklist, isEmployerCompanyComplete } from "@/lib/employer-company";
import {
  fetchEmployerCompany,
  saveEmployerCompany,
  type CompanyFormInput,
} from "@/lib/employer-job-listings-api";
import { safeRedirectPath } from "@/lib/safe-redirect";

export function EmployerCompanyManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToParam = searchParams.get("returnTo");
  const returnTo = returnToParam ? safeRedirectPath(returnToParam) : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initial, setInitial] = useState<Partial<CompanyFormInput>>({});

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchEmployerCompany();
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load company profile");
      setLoading(false);
      return;
    }
    if ("company" in result && result.company) {
      const c = result.company;
      setInitial({
        name: c.name,
        tagline: c.tagline ?? "",
        about: c.about ?? "",
        website: c.website ?? "",
        linkedin: c.linkedin ?? "",
        locations: c.locations ?? "",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(data: CompanyFormInput) {
    setError(null);
    setSuccess(null);
    setSaving(true);
    const result = await saveEmployerCompany(data);
    setSaving(false);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not save company profile");
      return;
    }
    if ("company" in result) {
      const c = result.company;
      setInitial({
        name: c.name,
        tagline: c.tagline ?? "",
        about: c.about ?? "",
        website: c.website ?? "",
        linkedin: c.linkedin ?? "",
        locations: c.locations ?? "",
      });
      if (returnTo && isEmployerCompanyComplete(c)) {
        router.push(returnTo);
        return;
      }
      setSuccess("Company profile saved.");
    }
  }

  const checklist = companyProfileChecklist(
    initial.name
      ? {
          id: "",
          name: initial.name,
          tagline: initial.tagline || null,
          about: initial.about || null,
          website: initial.website || null,
          linkedin: initial.linkedin || null,
          locations: initial.locations || null,
        }
      : null,
  );
  const complete = checklist.name && checklist.tagline && checklist.about;

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Brand"
        title="Company profile"
        subtitle="How candidates see your organisation on the job board. Required before you can create job postings."
      />

      {returnTo ? (
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          After saving, you will return to{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">job postings</span>.
        </p>
      ) : null}

      {error ? (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
          {success}
          {returnTo && !complete ? (
            <>
              {" "}
              Fill in the remaining required fields, then save again to continue.
            </>
          ) : null}
        </p>
      ) : null}

      {!complete && !loading ? (
        <div className="mb-6 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-medium">Profile incomplete</p>
          <ul className="mt-2 space-y-1">
            <li>{checklist.name ? "✓" : "○"} Company name</li>
            <li>{checklist.tagline ? "✓" : "○"} Tagline</li>
            <li>{checklist.about ? "✓" : "○"} About (20+ characters)</li>
          </ul>
        </div>
      ) : null}

      <div className="max-w-2xl rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 sm:p-8">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading profile…</p>
        ) : (
          <EmployerCompanyForm
            key={JSON.stringify(initial)}
            initial={initial}
            submitLabel={returnTo ? "Save and continue" : "Save profile"}
            loading={saving}
            onSubmit={handleSave}
          />
        )}
      </div>

      {returnTo ? (
        <Link
          href={returnTo}
          className="mt-6 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back without saving
        </Link>
      ) : null}
    </div>
  );
}
