"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  createReminder,
  deleteReminder,
  fetchApplicationReminders,
  formatScheduleDateTime,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  updateReminder,
  type ApplicationReminder,
} from "@/lib/seeker-schedule-api";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

function defaultRemindAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(9, 0, 0, 0);
  return toDatetimeLocalValue(d.toISOString());
}

type ApplicationRemindersPanelProps = {
  applicationId: string;
};

export function ApplicationRemindersPanel({ applicationId }: ApplicationRemindersPanelProps) {
  const [items, setItems] = useState<ApplicationReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    remindAt: defaultRemindAt(),
    notes: "",
  });

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchApplicationReminders(applicationId);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load reminders");
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

    const result = await createReminder(applicationId, {
      title: form.title.trim(),
      remindAt: fromDatetimeLocalValue(form.remindAt),
      notes: form.notes.trim() || undefined,
    });

    setSaving(false);

    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not add reminder");
      return;
    }

    if ("reminder" in result) {
      setItems((prev) =>
        [...prev, result.reminder].sort(
          (a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime(),
        ),
      );
      setForm({ title: "", remindAt: defaultRemindAt(), notes: "" });
      setShowForm(false);
    }
  }

  async function handleStatus(reminderId: string, status: "DONE" | "CANCELLED") {
    const result = await updateReminder(applicationId, reminderId, { status });
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not update reminder");
      return;
    }
    if ("reminder" in result) {
      setItems((prev) => prev.map((r) => (r.id === reminderId ? result.reminder : r)));
    }
  }

  async function handleDelete(reminderId: string) {
    if (!window.confirm("Delete this reminder?")) return;
    const err = await deleteReminder(applicationId, reminderId);
    if (err?.error) {
      setError(err.error.message ?? "Could not delete reminder");
      return;
    }
    setItems((prev) => prev.filter((r) => r.id !== reminderId));
  }

  const pending = items.filter((r) => r.status === "PENDING");
  const done = items.filter((r) => r.status !== "PENDING");

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Reminders</h4>
        <Button type="button" variant="secondary" size="xs" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add reminder"}
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/40">
          <div>
            <label htmlFor="reminder-title" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Title
            </label>
            <input
              id="reminder-title"
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={fieldClass}
              placeholder="Follow up with recruiter"
            />
          </div>
          <div>
            <label htmlFor="reminder-when" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Remind at
            </label>
            <input
              id="reminder-when"
              type="datetime-local"
              required
              value={form.remindAt}
              onChange={(e) => setForm((f) => ({ ...f, remindAt: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="reminder-notes" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Notes
            </label>
            <textarea
              id="reminder-notes"
              rows={2}
              maxLength={4000}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <Button type="submit" variant="success" size="sm" disabled={saving}>
            {saving ? "Saving…" : "Save reminder"}
          </Button>
        </form>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {loading ? (
        <p className="mt-3 text-sm text-zinc-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No reminders yet.</p>
      ) : (
        <div className="mt-3 space-y-4">
          {pending.length > 0 ? (
            <ul className="space-y-3">
              {pending.map((row) => {
                const overdue = new Date(row.remindAt) < new Date();
                return (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/30"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.title}</p>
                        {overdue ? (
                          <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
                            Overdue
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {formatScheduleDateTime(row.remindAt)}
                      </p>
                      {row.notes ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{row.notes}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="success" size="xs" onClick={() => void handleStatus(row.id, "DONE")}>
                        Done
                      </Button>
                      <Button type="button" variant="secondary" size="xs" onClick={() => void handleStatus(row.id, "CANCELLED")}>
                        Cancel
                      </Button>
                      <Button type="button" variant="ghost" size="xs" onClick={() => void handleDelete(row.id)}>
                        Delete
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {done.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Completed</p>
              <ul className="mt-2 space-y-2">
                {done.map((row) => (
                  <li key={row.id} className="text-sm text-zinc-500 line-through">
                    {row.title} · {formatScheduleDateTime(row.remindAt)} ({row.status.toLowerCase()})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
