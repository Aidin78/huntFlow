import Link from "next/link";

import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { SampleDataBanner } from "@/components/dashboard/SampleDataBanner";
import {
  employerOverview,
  employerSampleApplicants,
  employerSampleJobs,
} from "@/content/employer-dashboard-sample";

function stageClass(stage: string) {
  switch (stage) {
    case "New":
      return "bg-sky-500/12 text-sky-800 ring-sky-500/20 dark:text-sky-200";
    case "Interview":
      return "bg-violet-500/12 text-violet-800 ring-violet-500/20 dark:text-violet-200";
    case "Offer":
      return "bg-emerald-500/12 text-emerald-800 ring-emerald-500/20 dark:text-emerald-200";
    default:
      return "bg-zinc-500/10 text-zinc-700 ring-zinc-500/15 dark:text-zinc-300";
  }
}

function statusClass(status: string) {
  switch (status) {
    case "Published":
      return "bg-emerald-500/12 text-emerald-800 ring-emerald-500/20";
    case "Draft":
      return "bg-amber-500/12 text-amber-900 ring-amber-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-600 ring-zinc-500/15";
  }
}

export default function EmployerOverviewPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Employer"
        title={employerOverview.title}
        subtitle={employerOverview.subtitle}
      />
      <SampleDataBanner />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {employerOverview.stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{stat.value}</p>
            <p className="mt-1 text-xs text-zinc-500">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {employerOverview.quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={
              action.primary
                ? "inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                : "inline-flex rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            }
          >
            {action.label}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent postings</h2>
            <Link
              href="/dashboard/employer/jobs"
              className="text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {employerSampleJobs.slice(0, 3).map((job) => (
              <li key={job.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{job.title}</p>
                  <p className="text-xs text-zinc-500">{job.location}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass(job.status)}`}
                >
                  {job.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Latest applications</h2>
            <Link
              href="/dashboard/employer/applications"
              className="text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {employerSampleApplicants.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{row.name}</p>
                  <p className="text-xs text-zinc-500">{row.role}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${stageClass(row.stage)}`}
                >
                  {row.stage}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
