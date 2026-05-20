import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardStatCard } from "@/components/dashboard/dashboard-ui";
import { SampleDataBanner } from "@/components/dashboard/SampleDataBanner";
import { LinkButton } from "@/components/ui/button";
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

const statTones = ["emerald", "sky", "violet", "amber"] as const;

export default function EmployerOverviewPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Employer"
        title={employerOverview.title}
        subtitle={employerOverview.subtitle}
        actions={
          <LinkButton href="/dashboard/employer/jobs" variant="success" size="md">
            New posting
          </LinkButton>
        }
      />
      <SampleDataBanner />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {employerOverview.stats.map((stat, i) => (
          <DashboardStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.change}
            tone={statTones[i % statTones.length]}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {employerOverview.quickActions.map((action) => (
          <LinkButton
            key={action.label}
            href={action.href}
            variant={action.primary ? "success" : "secondary"}
            size="md"
          >
            {action.label}
          </LinkButton>
        ))}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Recent postings" accent="sky">
          <div className="mb-4 flex justify-end">
            <Link
              href="/dashboard/employer/jobs"
              className="text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400"
            >
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {employerSampleJobs.slice(0, 3).map((job) => (
              <li key={job.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{job.title}</p>
                  <p className="text-xs text-zinc-500">{job.location}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass(job.status)}`}
                >
                  {job.status}
                </span>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard title="Latest applications" accent="emerald">
          <div className="mb-4 flex justify-end">
            <Link
              href="/dashboard/employer/applications"
              className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {employerSampleApplicants.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{row.name}</p>
                  <p className="text-xs text-zinc-500">{row.role}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${stageClass(row.stage)}`}
                >
                  {row.stage}
                </span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
}
