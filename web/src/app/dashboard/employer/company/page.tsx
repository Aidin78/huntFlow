import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { SampleDataBanner } from "@/components/dashboard/SampleDataBanner";
import { employerCompanySample } from "@/content/employer-dashboard-sample";

export default function EmployerCompanyPage() {
  const c = employerCompanySample;

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Brand"
        title="Company profile"
        subtitle="How candidates see your organisation on the job board and careers page."
      />
      <SampleDataBanner />

      <div className="max-w-2xl rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 sm:p-8">
        <dl className="space-y-5 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Company name</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{c.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Tagline</dt>
            <dd className="mt-1 text-zinc-700 dark:text-zinc-300">{c.tagline}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Website</dt>
            <dd className="mt-1">
              <a href={c.website} className="font-medium text-sky-700 hover:underline dark:text-sky-400">
                {c.website}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Locations</dt>
            <dd className="mt-1 text-zinc-700 dark:text-zinc-300">{c.locations}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">About</dt>
            <dd className="mt-1 leading-relaxed text-zinc-600 dark:text-zinc-400">{c.about}</dd>
          </div>
        </dl>
        <button
          type="button"
          disabled
          className="mt-8 cursor-not-allowed rounded-full border border-dashed border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-500 dark:border-zinc-600"
        >
          Edit profile (coming soon)
        </button>
      </div>
    </div>
  );
}
