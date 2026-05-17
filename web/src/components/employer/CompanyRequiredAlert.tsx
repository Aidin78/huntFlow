import Link from "next/link";

import { companyProfileChecklist } from "@/lib/employer-company";
import type { EmployerCompany } from "@/lib/employer-job-listings-api";

type CompanyRequiredAlertProps = {
  company: EmployerCompany | null;
  title?: string;
  returnTo?: string;
};

export function CompanyRequiredAlert({
  company,
  title = "Complete your company profile first",
  returnTo,
}: CompanyRequiredAlertProps) {
  const checklist = companyProfileChecklist(company);
  const href = returnTo
    ? `/dashboard/employer/company?returnTo=${encodeURIComponent(returnTo)}`
    : "/dashboard/employer/company";

  return (
    <div
      role="alert"
      className="mb-8 rounded-3xl border border-amber-300/80 bg-amber-50/90 p-5 dark:border-amber-800/60 dark:bg-amber-950/40 sm:p-6"
    >
      <div className="flex gap-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-200/80 text-lg dark:bg-amber-900/60"
          aria-hidden
        >
          !
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-amber-950 dark:text-amber-100">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-amber-900/90 dark:text-amber-200/90">
            Job postings are linked to your company. Add your company name, a short tagline, and an about section
            before you create or publish roles.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-amber-900 dark:text-amber-100/90">
            <li className={checklist.name ? "line-through opacity-60" : ""}>
              {checklist.name ? "✓" : "○"} Company name
            </li>
            <li className={checklist.tagline ? "line-through opacity-60" : ""}>
              {checklist.tagline ? "✓" : "○"} Tagline (one line about your company)
            </li>
            <li className={checklist.about ? "line-through opacity-60" : ""}>
              {checklist.about ? "✓" : "○"} About (at least 20 characters)
            </li>
          </ul>
          <Link
            href={href}
            className="mt-5 inline-flex rounded-full bg-amber-900 px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-amber-800 dark:bg-amber-100 dark:text-amber-950 dark:hover:bg-white"
          >
            Complete company profile
          </Link>
        </div>
      </div>
    </div>
  );
}
