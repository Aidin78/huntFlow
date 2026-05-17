import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { SampleDataBanner } from "@/components/dashboard/SampleDataBanner";
import { employerTeamSample } from "@/content/employer-dashboard-sample";

export default function EmployerTeamPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Collaboration"
        title="Team"
        subtitle="Invite hiring managers and recruiters to your workspace."
      />
      <SampleDataBanner />

      <ul className="max-w-2xl space-y-3">
        {employerTeamSample.map((member) => (
          <li
            key={member.email}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-200/80 bg-white/90 px-5 py-4 dark:border-zinc-800/80 dark:bg-zinc-900/60"
          >
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{member.name}</p>
              <p className="text-sm text-zinc-500">{member.email}</p>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {member.role}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled
        className="mt-6 cursor-not-allowed rounded-full border border-dashed border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-500 dark:border-zinc-600"
      >
        Invite teammate (coming soon)
      </button>
    </div>
  );
}
