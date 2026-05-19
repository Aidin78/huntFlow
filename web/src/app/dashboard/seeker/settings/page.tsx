import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";

export default function JobSeekerSettingsPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Account"
        title="Settings"
        subtitle="Profile and notification preferences will live here."
      />
      <div className="max-w-lg rounded-3xl border border-dashed border-zinc-300 bg-white/50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Settings are coming soon.</p>
      </div>
    </div>
  );
}
