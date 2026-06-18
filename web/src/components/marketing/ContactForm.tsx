"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { supportMeta } from "@/content/support-content";
import { submitContactForm } from "@/lib/contact-api";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await submitContactForm({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      website: form.website,
    });

    setSubmitting(false);

    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not send your message. Please try again.");
      return;
    }

    setSuccess(true);
    setForm(initialForm);
  }

  if (success) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
        Thanks — we received your message and will reply within 2 business days.
      </div>
    );
  }

  return (
    <>
      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={fieldClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="contact-subject" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Subject
          </label>
          <input
            id="contact-subject"
            name="subject"
            required
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className={fieldClass}
          />
        </div>
        <Button type="submit" variant="success" disabled={submitting}>
          {submitting ? "Sending…" : "Send message"}
        </Button>
      </form>

      <p className="mt-6 text-xs text-zinc-500">
        Or email us directly at{" "}
        <a href={`mailto:${supportMeta.contactEmail}`} className="font-semibold text-emerald-700 dark:text-emerald-400">
          {supportMeta.contactEmail}
        </a>
        . {supportMeta.contactResponseTime}
      </p>
    </>
  );
}
