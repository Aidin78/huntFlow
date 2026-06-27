"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  createContact,
  deleteContact,
  fetchApplicationContacts,
  updateContact,
  type ApplicationContact,
} from "@/lib/seeker-contacts-api";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

const emptyForm = {
  name: "",
  role: "",
  title: "",
  email: "",
  phone: "",
  linkedin: "",
  notes: "",
};

type ApplicationContactsPanelProps = {
  applicationId: string;
  readOnly?: boolean;
  initialItems?: ApplicationContact[];
};

export function ApplicationContactsPanel({
  applicationId,
  readOnly = false,
  initialItems,
}: ApplicationContactsPanelProps) {
  const [items, setItems] = useState<ApplicationContact[]>(initialItems ?? []);
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
    const result = await fetchApplicationContacts(applicationId);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load contacts");
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

  function startEdit(contact: ApplicationContact) {
    setEditingId(contact.id);
    setShowForm(false);
    setForm({
      name: contact.name,
      role: contact.role ?? "",
      title: contact.title ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      linkedin: contact.linkedin ?? "",
      notes: contact.notes ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      role: form.role.trim() || undefined,
      title: form.title.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      linkedin: form.linkedin.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    const result = editingId
      ? await updateContact(applicationId, editingId, payload)
      : await createContact(applicationId, payload);

    setSaving(false);

    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not save contact");
      return;
    }

    if ("contact" in result) {
      setItems((prev) => {
        const next = editingId
          ? prev.map((c) => (c.id === editingId ? result.contact : c))
          : [...prev, result.contact];
        return next.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });
      resetForm();
    }
  }

  async function handleDelete(contactId: string) {
    if (!window.confirm("Remove this contact from the application?")) return;
    const err = await deleteContact(applicationId, contactId);
    if (err?.error) {
      setError(err.error.message ?? "Could not delete contact");
      return;
    }
    setItems((prev) => prev.filter((c) => c.id !== contactId));
    if (editingId === contactId) resetForm();
  }

  const formOpen = !readOnly && (showForm || editingId !== null);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Contacts</h4>
          <p className="mt-1 text-sm text-zinc-500">
            {readOnly
              ? "Contacts the applicant added for this role."
              : "Recruiters and hiring contacts for this role."}
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
          {formOpen ? "Cancel" : "Add contact"}
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
              <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Name
              </label>
              <input
                id="contact-name"
                required
                maxLength={200}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="contact-role" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Role on application
              </label>
              <input
                id="contact-role"
                maxLength={100}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className={fieldClass}
                placeholder="Recruiter"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-title" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Job title
              </label>
              <input
                id="contact-title"
                maxLength={200}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                maxLength={320}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={fieldClass}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-phone" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Phone
              </label>
              <input
                id="contact-phone"
                maxLength={40}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="contact-linkedin" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                LinkedIn URL
              </label>
              <input
                id="contact-linkedin"
                type="url"
                maxLength={500}
                value={form.linkedin}
                onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="contact-notes" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Notes
            </label>
            <textarea
              id="contact-notes"
              rows={2}
              maxLength={4000}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <Button type="submit" variant="success" size="sm" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Save contact"}
          </Button>
        </form>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {loading ? (
        <p className="mt-3 text-sm text-zinc-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No contacts yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.name}</p>
                  {row.role ? (
                    <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      {row.role}
                    </p>
                  ) : null}
                  {row.title ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{row.title}</p>
                  ) : null}
                  <div className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {row.email ? (
                      <p>
                        <a href={`mailto:${row.email}`} className="text-sky-700 hover:underline dark:text-sky-300">
                          {row.email}
                        </a>
                      </p>
                    ) : null}
                    {row.phone ? <p>{row.phone}</p> : null}
                    {row.linkedin ? (
                      <p>
                        <a
                          href={row.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-700 hover:underline dark:text-sky-300"
                        >
                          LinkedIn
                        </a>
                      </p>
                    ) : null}
                  </div>
                  {row.notes ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{row.notes}</p>
                  ) : null}
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
