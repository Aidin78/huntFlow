import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { SampleDataBanner } from "@/components/dashboard/SampleDataBanner";
import { employerSettingsSample } from "@/content/employer-dashboard-sample";

function BellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}

export default function EmployerSettingsPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Account"
        title="Settings"
        subtitle="Notification preferences and employer account options."
      />
      <SampleDataBanner />

      <DashboardCard
        title="Notifications"
        description="Choose what you want to be notified about (sample preview)"
        icon={<BellIcon />}
        accent="violet"
        className="max-w-xl"
      >
        <ul className="space-y-3">
          {employerSettingsSample.notifications.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 px-4 py-3.5 dark:border-zinc-700/80 dark:bg-zinc-950/30"
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  item.enabled
                    ? "bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/20 dark:text-emerald-200"
                    : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {item.enabled ? "On" : "Off"}
              </span>
            </li>
          ))}
        </ul>
      </DashboardCard>
    </div>
  );
}
