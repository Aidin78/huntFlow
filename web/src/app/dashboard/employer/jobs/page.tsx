import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { SampleDataBanner } from "@/components/dashboard/SampleDataBanner";
import { employerSampleJobs } from "@/content/employer-dashboard-sample";

function statusClass(status: string) {
  switch (status) {
    case "Published":
      return "bg-emerald-500/12 text-emerald-800 ring-emerald-500/20 dark:text-emerald-200";
    case "Draft":
      return "bg-amber-500/12 text-amber-900 ring-amber-500/20 dark:text-amber-200";
    default:
      return "bg-zinc-500/10 text-zinc-600 ring-zinc-500/15 dark:text-zinc-400";
  }
}

export default function EmployerJobsPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Hiring"
        title="Job postings"
        subtitle="Manage open roles, drafts, and closed listings. Publishing will connect to the API soon."
      />
      <SampleDataBanner />

      <button
        type="button"
        disabled
        className="mb-6 inline-flex cursor-not-allowed rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        + New posting (coming soon)
      </button>

      <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/90 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-200/80 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80">
            <tr>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Applicants</th>
              <th className="px-5 py-3">Posted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {employerSampleJobs.map((job) => (
              <tr key={job.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">{job.title}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass(job.status)}`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">{job.location}</td>
                <td className="px-5 py-4 tabular-nums text-zinc-900 dark:text-zinc-100">{job.applicants}</td>
                <td className="px-5 py-4 text-zinc-500">{job.postedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
