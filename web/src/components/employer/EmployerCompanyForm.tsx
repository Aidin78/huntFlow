"use client";

import type { FormEvent } from "react";

import { LinkedInIcon, LocationIcon, PortfolioIcon } from "@/components/dashboard/dashboard-ui";
import { Button } from "@/components/ui/button";
import type { CompanyFormInput } from "@/lib/employer-job-listings-api";

const fieldClass =
  "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

type EmployerCompanyFormProps = {
  initial?: Partial<CompanyFormInput>;
  onSubmit: (data: CompanyFormInput) => void | Promise<void>;
  submitLabel: string;
  loading?: boolean;
};

const empty: CompanyFormInput = {
  name: "",
  tagline: "",
  about: "",
  website: "",
  linkedin: "",
  locations: "",
};

export function EmployerCompanyForm({
  initial,
  onSubmit,
  submitLabel,
  loading = false,
}: EmployerCompanyFormProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: CompanyFormInput = {
      name: String(fd.get("name") ?? "").trim(),
      tagline: String(fd.get("tagline") ?? "").trim(),
      about: String(fd.get("about") ?? "").trim(),
      website: String(fd.get("website") ?? "").trim() || undefined,
      linkedin: String(fd.get("linkedin") ?? "").trim() || undefined,
      locations: String(fd.get("locations") ?? "").trim() || undefined,
    };
    void onSubmit(data);
  }

  const v = { ...empty, ...initial };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Company name *
        </label>
        <input id="name" name="name" required maxLength={120} defaultValue={v.name} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="tagline" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Tagline *
        </label>
        <input
          id="tagline"
          name="tagline"
          required
          maxLength={200}
          defaultValue={v.tagline}
          className={fieldClass}
          placeholder="One line that describes your company"
        />
        <p className="mt-1 text-xs text-zinc-500">Shown on job cards and your careers presence.</p>
      </div>

      <div>
        <label htmlFor="about" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          About *
        </label>
        <textarea
          id="about"
          name="about"
          required
          minLength={20}
          maxLength={8000}
          rows={6}
          defaultValue={v.about}
          className={fieldClass}
          placeholder="Mission, culture, what you build — at least 20 characters"
        />
      </div>

      <div>
        <label htmlFor="locations" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <LocationIcon className="h-3.5 w-3.5" />
          Locations
        </label>
        <input
          id="locations"
          name="locations"
          maxLength={500}
          defaultValue={v.locations ?? ""}
          className={fieldClass}
          placeholder="e.g. London, UK · Remote across EU"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="website" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <PortfolioIcon className="h-3.5 w-3.5" />
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={v.website ?? ""}
            className={fieldClass}
            placeholder="https://"
          />
        </div>
        <div>
          <label htmlFor="linkedin" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <LinkedInIcon className="h-3.5 w-3.5" />
            LinkedIn
          </label>
          <input
            id="linkedin"
            name="linkedin"
            type="url"
            defaultValue={v.linkedin ?? ""}
            className={fieldClass}
            placeholder="https://linkedin.com/company/…"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
