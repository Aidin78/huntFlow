import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { SeekerProfileForm } from "@/components/seeker/SeekerProfileForm";

export default function JobSeekerSettingsPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <DashboardPageHeader
        badge="Account"
        title="Profile & resume"
        subtitle="What employers see when you apply, plus your resume file."
      />
      <SeekerProfileForm />
    </div>
  );
}
