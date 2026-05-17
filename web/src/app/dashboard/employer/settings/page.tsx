import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { SampleDataBanner } from "@/components/dashboard/SampleDataBanner";
import { employerSettingsSample } from "@/content/employer-dashboard-sample";

export default function EmployerSettingsPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Account"
        title="Settings"
        subtitle="Notification preferences and employer account options."
      />
      <SampleDataBanner />

      <ul className="max-w-xl space-y-3">
        {employerSettingsSample.notifications.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-3xl border border-zinc-200/80 bg-white/90 px-5 py-4 dark:border-zinc-800/80 dark:bg-zinc-900/60"
          >
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                item.enabled
                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {item.enabled ? "On" : "Off"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
