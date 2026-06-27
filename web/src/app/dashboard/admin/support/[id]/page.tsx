"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { BackLink } from "@/components/dashboard/BackLink";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import {
  fetchSupportInquiry,
  updateSupportInquiry,
  type SupportInquiryDetail,
} from "@/lib/admin-support-api";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export default function AdminSupportDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [inquiry, setInquiry] = useState<SupportInquiryDetail | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    const result = await fetchSupportInquiry(id);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load inquiry");
      setLoading(false);
      return;
    }
    if ("inquiry" in result) {
      setInquiry(result.inquiry);
      setAdminNotes(result.inquiry.adminNotes ?? "");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveNotes() {
    if (!id) return;
    setSaving(true);
    setError(null);
    const result = await updateSupportInquiry(id, { adminNotes });
    setSaving(false);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not save notes");
      return;
    }
    if ("inquiry" in result) {
      setInquiry(result.inquiry);
    }
  }

  async function setStatus(status: "OPEN" | "RESOLVED") {
    if (!id) return;
    setSaving(true);
    setError(null);
    const result = await updateSupportInquiry(id, { status });
    setSaving(false);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not update status");
      return;
    }
    if ("inquiry" in result) {
      setInquiry(result.inquiry);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading inquiry…</p>;
  }

  if (!inquiry) {
    return (
      <div>
        <BackLink href="/dashboard/admin/support">Back to inbox</BackLink>
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error ?? "Inquiry not found"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/admin/support">Back to inbox</BackLink>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{inquiry.subject}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {inquiry.name} · {inquiry.email} · {formatDate(inquiry.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {inquiry.status === "OPEN" ? (
            <Button type="button" variant="success" size="sm" disabled={saving} onClick={() => void setStatus("RESOLVED")}>
              Mark resolved
            </Button>
          ) : (
            <Button type="button" variant="secondary" size="sm" disabled={saving} onClick={() => void setStatus("OPEN")}>
              Reopen
            </Button>
          )}
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <DashboardCard title="Message" accent="sky" className="mt-6">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {inquiry.message}
        </p>
        {inquiry.user ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Linked account:{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {inquiry.user.name ?? inquiry.user.email}
            </span>{" "}
            ({inquiry.user.role})
          </p>
        ) : null}
        {inquiry.emailSent ? (
          <p className="mt-2 text-xs text-zinc-500">Notification email was sent when this was submitted.</p>
        ) : null}
      </DashboardCard>

      <DashboardCard title="Internal notes" accent="violet" className="mt-6">
        <label htmlFor="admin-notes" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Admin notes (not visible to the user)
        </label>
        <textarea
          id="admin-notes"
          rows={4}
          maxLength={4000}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          className={fieldClass}
        />
        <Button type="button" variant="secondary" size="sm" className="mt-3" disabled={saving} onClick={() => void saveNotes()}>
          {saving ? "Saving…" : "Save notes"}
        </Button>
      </DashboardCard>

      <p className="mt-6 text-sm text-zinc-500">
        Reply via your email client:{" "}
        <Link href={`mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}`} className="text-sky-700 hover:underline dark:text-sky-300">
          {inquiry.email}
        </Link>
      </p>
    </div>
  );
}
