"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  createLink,
  deleteLink,
  fetchApplicationLinks,
  updateLink,
  type ApplicationLink,
} from "@/lib/seeker-links-api";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

const PRESET_LABELS = ["Job posting", "Company page", "Portfolio", "LinkedIn", "Other"] as const;

const emptyForm = {
  labelPreset: "Company page" as (typeof PRESET_LABELS)[number],
  customLabel: "",
  url: "",
};

type ApplicationLinksPanelProps = {
  applicationId: string;
  readOnly?: boolean;
  initialItems?: ApplicationLink[];
};

export function ApplicationLinksPanel({
  applicationId,
  readOnly = false,
  initialItems,
}: ApplicationLinksPanelProps) {
  const [items, setItems] = useState<ApplicationLink[]>(initialItems ?? []);
  const [loading, setLoading] = useState(!readOnly && initialItems === undefined);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    if (readOnly && initialItems) {
      setItems(initialItems);
      setLoading(false);
      return;
    }

    setError(null);
    const result = await fetchApplicationLinks(applicationId);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load links");
      setLoading(false);
      return;
    }
    if ("items" in result) {
      setItems(result.items);
    }
    setLoading(false);
  }, [applicationId, initialItems, readOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
    }
  }, [initialItems]);

  function resolvedLabel(): string {
    if (form.labelPreset === "Other") {
      return form.customLabel.trim();
    }
    return form.labelPreset;
  }

  function startEdit(link: ApplicationLink) {
    const preset = PRESET_LABELS.find((p) => p === link.label);
    setEditingId(link.id);
    setShowForm(false);
    setForm({
      labelPreset: preset ?? "Other",
      customLabel: preset ? "" : (link.label ?? ""),
      url: link.url,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const label = resolvedLabel();
    const url = form.url.trim();
    if (!url) {
      setError("URL is required");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      label: label || undefined,
      url,
    };

    const result = editingId
      ? await updateLink(applicationId, editingId, payload)
      : await createLink(applicationId, payload);

    setSaving(false);

    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not save link");
      return;
    }

    if ("link" in result) {
      setItems((prev) => {
        const next = editingId
          ? prev.map((item) => (item.id === editingId ? result.link : item))
          : [...prev, result.link];
        return next.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });
      resetForm();
    }
  }

  async function handleDelete(linkId: string) {
    if (!window.confirm("Remove this link?")) return;
    const err = await deleteLink(applicationId, linkId);
    if (err?.error) {
      setError(err.error.message ?? "Could not delete link");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== linkId));
    if (editingId === linkId) resetForm();
  }

  const formOpen = !readOnly && (showForm || editingId !== null);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Links</h4>
          <p className="mt-1 text-sm text-zinc-500">
            {readOnly
              ? "Related URLs shared on this application."
              : "Job posting, portfolio, and other URLs for this role."}
          </p>
        </div>
        {!readOnly ? (
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => {
              if (formOpen) {
                resetForm();
              } else {
                setShowForm(true);
                setEditingId(null);
                setForm(emptyForm);
              }
            }}
          >
            {formOpen ? "Cancel" : "Add link"}
          </Button>
        ) : null}
      </div>

      {formOpen ? (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-4 space-y-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/40"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="link-label" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Label
              </label>
              <select
                id="link-label"
                value={form.labelPreset}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    labelPreset: e.target.value as (typeof PRESET_LABELS)[number],
                  }))
                }
                className={fieldClass}
              >
                {PRESET_LABELS.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {form.labelPreset === "Other" ? (
              <div>
                <label
                  htmlFor="link-custom-label"
                  className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
                >
                  Custom label
                </label>
                <input
                  id="link-custom-label"
                  maxLength={100}
                  value={form.customLabel}
                  onChange={(e) => setForm((f) => ({ ...f, customLabel: e.target.value }))}
                  className={fieldClass}
                />
              </div>
            ) : null}
          </div>
          <div>
            <label htmlFor="link-url" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              URL
            </label>
            <input
              id="link-url"
              type="url"
              required
              maxLength={2000}
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className={fieldClass}
              placeholder="https://"
            />
          </div>
          <Button type="submit" variant="success" size="sm" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Save link"}
          </Button>
        </form>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {loading ? (
        <p className="mt-3 text-sm text-zinc-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No links yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {row.label ? (
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      {row.label}
                    </p>
                  ) : null}
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm font-medium text-sky-700 hover:underline dark:text-sky-300"
                  >
                    {row.url}
                  </a>
                </div>
                {!readOnly ? (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" size="xs" onClick={() => startEdit(row)}>
                      Edit
                    </Button>
                    <Button type="button" variant="ghost" size="xs" onClick={() => void handleDelete(row.id)}>
                      Delete
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
