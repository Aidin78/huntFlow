import { Suspense } from "react";

import { SeekerApplicationsList } from "@/components/dashboard/SeekerApplicationsList";

export default function JobSeekerApplicationsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-zinc-500">Loading applications…</p>}>
      <SeekerApplicationsList />
    </Suspense>
  );
}
