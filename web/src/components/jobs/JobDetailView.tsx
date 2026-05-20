import type { ReactNode } from "react";
import Link from "next/link";

import { BackLink } from "@/components/dashboard/BackLink";
import {
  ExternalLinkButton,
  LocationIcon,
  PortfolioIcon,
  SocialLinkButton,
} from "@/components/dashboard/dashboard-ui";
import { JobApplyButton } from "@/components/jobs/JobApplyButton";
import { LinkButton } from "@/components/ui/button";
import {
  experienceLabel,
  formatPublishedDate,
  type JobListingDetail,
  workArrangementLabel,
  type WorkArrangement,
} from "@/lib/job-listings-api";

function arrangementTone(w: WorkArrangement): string {
  switch (w) {
    case "REMOTE":
      return "bg-sky-500/12 text-sky-800 ring-sky-500/20 dark:text-sky-200";
    case "HYBRID":
      return "bg-violet-500/12 text-violet-800 ring-violet-500/20 dark:text-violet-200";
    default:
      return "bg-zinc-500/10 text-zinc-700 ring-zinc-500/15 dark:text-zinc-300";
  }
}

function companyGradient(name: string): string {
  const gradients = [
    "from-emerald-500 to-teal-600",
    "from-sky-500 to-blue-600",
    "from-violet-500 to-purple-600",
    "from-amber-500 to-orange-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length]!;
}

function BriefcaseIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.75V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function SalaryIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

type MetaItemProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function MetaItem({ icon, label, value }: MetaItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
        {icon}
      </span>
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
      </div>
    </div>
  );
}

type JobDetailViewProps = {
  job: JobListingDetail;
};

export function JobDetailView({ job }: JobDetailViewProps) {
  const initial = job.company.name.trim().charAt(0).toUpperCase() || "?";
  const gradient = companyGradient(job.company.name);
  const hasLinks = Boolean(job.company.website || job.company.linkedin || job.sourceUrl);

  return (
    <article>
      <BackLink href="/jobs">All jobs</BackLink>

      <div className="mt-2 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        <div className="lg:col-span-2">
          <header className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/70">
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradient}`} />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <span
                  className={`inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold text-white shadow-md ${gradient}`}
                  aria-hidden
                >
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-emerald-800 ring-1 ring-emerald-500/15 dark:text-emerald-300">
                    {job.company.name}
                  </p>
                  <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
                    {job.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${arrangementTone(job.workArrangement)}`}
                    >
                      {workArrangementLabel(job.workArrangement)}
                    </span>
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-100">
                      {experienceLabel(job.experienceLevel)}
                    </span>
                    {job.salaryText ? (
                      <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-500/20 dark:text-amber-200">
                        {job.salaryText}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <MetaItem icon={<LocationIcon />} label="Location" value={job.city ?? "Not specified"} />
                <MetaItem icon={<BriefcaseIcon />} label="Work style" value={workArrangementLabel(job.workArrangement)} />
                <MetaItem icon={<CalendarIcon />} label="Posted" value={formatPublishedDate(job.publishedAt)} />
                {job.salaryText ? (
                  <MetaItem icon={<SalaryIcon />} label="Compensation" value={job.salaryText} />
                ) : (
                  <MetaItem icon={<SalaryIcon />} label="Level" value={experienceLabel(job.experienceLevel)} />
                )}
              </div>
            </div>
          </header>

          {job.summary ? (
            <section className="relative mt-6 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/70">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500" />
              <div className="p-6 sm:p-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">About this role</h2>
                <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {job.summary}
                </p>
              </div>
            </section>
          ) : null}

          {hasLinks ? (
            <section className="relative mt-6 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/70">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 to-purple-500" />
              <div className="p-6 sm:p-8">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  <PortfolioIcon className="h-4 w-4" />
                  Company & links
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.company.website ? (
                    <SocialLinkButton kind="portfolio" href={job.company.website} label="Website" />
                  ) : null}
                  {job.company.linkedin ? (
                    <SocialLinkButton kind="linkedin" href={job.company.linkedin} label="LinkedIn" />
                  ) : null}
                  {job.sourceUrl ? (
                    <ExternalLinkButton href={job.sourceUrl} label="Original posting" />
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          <div className="mt-8 lg:hidden">
            <ApplyCard jobId={job.id} />
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ApplyCard jobId={job.id} />
          </div>
        </aside>
      </div>
    </article>
  );
}

function ApplyCard({ jobId }: { jobId: string }) {
  return (
    <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-50 via-white to-white p-6 shadow-sm dark:border-emerald-500/20 dark:from-emerald-950/30 dark:via-zinc-900/70 dark:to-zinc-900/70">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Interested?</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Apply with huntFlow to track this role in your pipeline. Sign in as a job seeker to submit your profile and
        optional cover letter.
      </p>
      <JobApplyButton listingId={jobId} size="large" className="mt-6 w-full" />
      <p className="mt-4 text-center text-xs text-zinc-500">
        No account?{" "}
        <Link href="/register" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
          Create one free
        </Link>
      </p>
    </div>
  );
}

type JobDetailStatesProps = {
  loading: boolean;
  error: string | null;
  notFound: boolean;
};

export function JobDetailStates({ loading, error, notFound }: JobDetailStatesProps) {
  if (loading) {
    return (
      <div className="mt-12 space-y-4">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-48 animate-pulse rounded-3xl bg-white/60 dark:bg-zinc-900/40" />
        <div className="h-32 animate-pulse rounded-3xl bg-white/60 dark:bg-zinc-900/40" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="mt-10 rounded-3xl border border-amber-200/90 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
        {error}
      </p>
    );
  }

  if (notFound) {
    return (
      <div className="mt-16 rounded-3xl border border-dashed border-zinc-300 bg-white/80 px-8 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Role not found</p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This listing may have been removed or is no longer active.
        </p>
        <LinkButton href="/jobs" variant="success" size="md" className="mt-6">
          Browse jobs
        </LinkButton>
      </div>
    );
  }

  return null;
}
