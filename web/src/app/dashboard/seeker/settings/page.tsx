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
        subtitle="Profile, resume, tags, and what you want to see in your notification bell."
      />
      <SeekerNotificationSettings />
      <SeekerProfileForm />
      <SeekerTagManager />
    </div>
  );
}
