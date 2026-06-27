import { AccountDangerZone } from "@/components/settings/AccountDangerZone";
import { PushNotificationSettings } from "@/components/settings/PushNotificationSettings";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { SeekerNotificationSettings } from "@/components/seeker/SeekerNotificationSettings";
import { SeekerProfileForm } from "@/components/seeker/SeekerProfileForm";
import { SeekerTagManager } from "@/components/seeker/SeekerTagManager";

export default function JobSeekerSettingsPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Account"
        title="Settings"
        subtitle="Profile, resume, tags, notifications, and account security."
      />
      <PushNotificationSettings />
      <SeekerNotificationSettings />
      <SeekerProfileForm />
      <SeekerTagManager />
      <AccountDangerZone audience="seeker" />
    </div>
  );
}
