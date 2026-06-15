"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { joinClasses } from "@/components/ui/button";
import {
  applicationStatusLabel,
  updateSeekerApplicationStatus,
  type JobApplicationStatus,
  type SeekerManualStatus,
  type StatusHistoryEvent,
} from "@/lib/seeker-applications-api";

const MANUAL_STATUSES: SeekerManualStatus[] = [
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "ARCHIVED",
];

type SeekerApplicationStatusControlProps = {
  applicationId: string;
  currentStatus: JobApplicationStatus;
  onUpdated: (status: JobApplicationStatus, event: StatusHistoryEvent) => void;
};

export function SeekerApplicationStatusControl({
  applicationId,
  currentStatus,
  onUpdated,
}: SeekerApplicationStatusControlProps) {
  const [saving, setSaving] = useState<SeekerManualStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(next: SeekerManualStatus) {
    if (next === currentStatus || saving) return;
    setSaving(next);
    setError(null);

    const result = await updateSeekerApplicationStatus(applicationId, next);

    setSaving(null);

    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not update status");
      return;
    }

    if ("application" in result) {
      onUpdated(result.application.status, result.event);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={currentStatus} size="md" />
        <div className="flex flex-wrap gap-1.5">
          {MANUAL_STATUSES.map((status) => {
            const active = currentStatus === status;
            const loading = saving === status;
            return (
              <button
                key={status}
                type="button"
                disabled={active || saving !== null}
                onClick={() => void setStatus(status)}
                className={joinClasses(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:text-emerald-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
                  saving !== null && !loading && "opacity-50",
                )}
              >
                {loading ? "Saving…" : applicationStatusLabel(status)}
              </button>
            );
          })}
        </div>
      </div>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
