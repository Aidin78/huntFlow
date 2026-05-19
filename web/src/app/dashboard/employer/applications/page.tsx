import { Suspense } from "react";

import { EmployerApplicationsManager } from "@/components/employer/EmployerApplicationsManager";

export default function EmployerApplicationsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-zinc-500">Loading applications…</p>}>
      <EmployerApplicationsManager />
    </Suspense>
  );
}
