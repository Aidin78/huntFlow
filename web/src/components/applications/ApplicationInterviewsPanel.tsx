"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  createInterview,
  deleteInterview,
  fetchApplicationInterviews,
  formatScheduleDateTime,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  type ApplicationInterview,
} from "@/lib/seeker-schedule-api";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

function defaultScheduledAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(10, 0, 0, 0);
  return toDatetimeLocalValue(d.toISOString());
}

type ApplicationInterviewsPanelProps = {
  applicationId: string;
};

export function ApplicationInterviewsPanel({ applicationId }: ApplicationInterviewsPanelProps) {
  const [items, setItems] = useState<ApplicationInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    scheduledAt: defaultScheduledAt(),
    durationMinutes: "",
    location: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchApplicationInterviews(applicationId);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load interviews");
      setLoading(false);
      return;
    }
    if ("items" in result) {
      setItems(result.items);
    }
    setLoading(false);
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result = await createInterview(applicationId, {
      title: form.title.trim(),
      scheduledAt: fromDatetimeLocalValue(form.scheduledAt),
      durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
      location: form.location.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });

    setSaving(false);

    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not add interview");
      return;
    }

    if ("interview" in result) {
      setItems((prev) =>
        [...prev, result.interview].sort(
          (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
        ),
      );
      setForm({ title: "", scheduledAt: defaultScheduledAt(), durationMinutes: "", location: "", notes: "" });
      setShowForm(false);
    }
  }

  async function handleDelete(interviewId: string) {
    if (!window.confirm("Delete this interview?")) return;
    const err = await deleteInterview(applicationId, interviewId);
    if (err?.error) {
      setError(err.error.message ?? "Could not delete interview");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== interviewId));
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Interviews</h4>
        <Button type="button" variant="secondary" size="xs" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add interview"}
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/40">
          <div>
            <label htmlFor="interview-title" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Title
            </label>
            <input
              id="interview-title"
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={fieldClass}
              placeholder="Tech screen"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="interview-when" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Scheduled
              </label>
              <input
                id="interview-when"
                type="datetime-local"
                required
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="interview-duration" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Duration (min)
              </label>
              <input
                id="interview-duration"
                type="number"
                min={1}
                max={480}
                value={form.durationMinutes}
                onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                className={fieldClass}
                placeholder="45"
              />
            </div>
          </div>
          <div>
            <label htmlFor="interview-location" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Location
            </label>
            <input
              id="interview-location"
              maxLength={200}
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className={fieldClass}
              placeholder="Zoom link or office address"
            />
          </div>
          <div>
            <label htmlFor="interview-notes" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Notes
            </label>
            <textarea
              id="interview-notes"
              rows={2}
              maxLength={4000}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <Button type="submit" variant="success" size="sm" disabled={saving}>
            {saving ? "Saving…" : "Save interview"}
          </Button>
        </form>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {loading ? (
        <p className="mt-3 text-sm text-zinc-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No interviews scheduled yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/30"
            >
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.title}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {formatScheduleDateTime(row.scheduledAt)}
                  {row.durationMinutes ? ` · ${row.durationMinutes} min` : ""}
                </p>
                {row.location ? (
                  <p className="mt-1 text-sm text-zinc-500">{row.location}</p>
                ) : null}
                {row.notes ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{row.notes}</p>
                ) : null}
              </div>
              <Button type="button" variant="ghost" size="xs" onClick={() => void handleDelete(row.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
