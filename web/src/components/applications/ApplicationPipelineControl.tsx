"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button, joinClasses } from "@/components/ui/button";
import {
  updateEmployerApplicationStatus,
  type JobApplicationStatus,
  type StatusHistoryEvent,
} from "@/lib/employer-applications-api";

const PIPELINE_STATUSES = ["INTERVIEW", "OFFER", "REJECTED"] as const;

type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

type ApplicationPipelineControlProps = {
  applicationId: string;
  currentStatus: JobApplicationStatus;
  onUpdated: (status: JobApplicationStatus, event: StatusHistoryEvent) => void;
};

export function ApplicationPipelineControl({
  applicationId,
  currentStatus,
  onUpdated,
}: ApplicationPipelineControlProps) {
  const [saving, setSaving] = useState<PipelineStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");

  async function setStatus(next: PipelineStatus) {
    if (next === currentStatus || saving) return;
    setSaving(next);
    setError(null);

    const result = await updateEmployerApplicationStatus(applicationId, {
      status: next,
      note: note.trim() || undefined,
    });

    setSaving(null);

    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not update status");
      return;
    }

    if ("application" in result) {
      onUpdated(result.application.status, result.event);
      setNote("");
      setShowNote(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={currentStatus} size="md" />
        <div className="flex flex-wrap gap-1.5">
          {PIPELINE_STATUSES.map((status) => {
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
                {loading ? "Saving…" : status === "INTERVIEW" ? "Interview" : status === "OFFER" ? "Offer" : "Rejected"}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => setShowNote((v) => !v)}
        >
          {showNote ? "Hide note" : "Add note"}
        </Button>
        {showNote ? (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Optional note for the candidate…"
            className="mt-2 w-full max-w-md rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950"
          />
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
