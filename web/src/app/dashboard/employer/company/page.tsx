import { Suspense } from "react";

import { EmployerCompanyManager } from "@/components/employer/EmployerCompanyManager";

export default function EmployerCompanyPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-zinc-500">Loading…</p>}>
      <EmployerCompanyManager />
    </Suspense>
  );
}
