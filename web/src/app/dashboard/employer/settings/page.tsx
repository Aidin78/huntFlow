import { AccountDangerZone } from "@/components/settings/AccountDangerZone";
import { PushNotificationSettings } from "@/components/settings/PushNotificationSettings";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { EmployerNotificationSettings } from "@/components/employer/EmployerNotificationSettings";

export default function EmployerSettingsPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Account"
        title="Settings"
        subtitle="Notification preferences and employer account options."
      />
      <PushNotificationSettings />
      <EmployerNotificationSettings />
      <AccountDangerZone audience="employer" />
    </div>
  );
}
