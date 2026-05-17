import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { SampleDataBanner } from "@/components/dashboard/SampleDataBanner";
import { employerSampleApplicants } from "@/content/employer-dashboard-sample";

function stageClass(stage: string) {
  switch (stage) {
    case "New":
      return "bg-sky-500/12 text-sky-800 ring-sky-500/20 dark:text-sky-200";
    case "Interview":
      return "bg-violet-500/12 text-violet-800 ring-violet-500/20 dark:text-violet-200";
    case "Offer":
      return "bg-emerald-500/12 text-emerald-800 ring-emerald-500/20 dark:text-emerald-200";
    case "Rejected":
      return "bg-red-500/10 text-red-800 ring-red-500/20 dark:text-red-200";
    default:
      return "bg-zinc-500/10 text-zinc-700 ring-zinc-500/15 dark:text-zinc-300";
  }
}

export default function EmployerApplicationsPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Pipeline"
        title="Applications"
        subtitle="Review candidates who applied to your postings. Stages and actions will sync with the API later."
      />
      <SampleDataBanner />

      <ul className="space-y-3">
        {employerSampleApplicants.map((row) => (
          <li
            key={row.id}
            className="flex flex-col gap-3 rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800/80 dark:bg-zinc-900/60"
          >
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{row.name}</p>
              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{row.role}</p>
              <p className="mt-1 text-xs text-zinc-500">Applied {row.appliedAt}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${stageClass(row.stage)}`}
              >
                {row.stage}
              </span>
              <button
                type="button"
                disabled
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:border-zinc-600"
              >
                Open profile
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
