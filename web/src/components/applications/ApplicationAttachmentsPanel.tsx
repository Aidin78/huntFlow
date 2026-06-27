"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchAttachmentBlobUrl } from "@/lib/authenticated-file";
import {
  deleteApplicationAttachment,
  fetchApplicationAttachments,
  uploadApplicationAttachment,
  type ApplicationAttachment,
} from "@/lib/seeker-attachments-api";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return "—";
  return `${(bytes / 1024).toFixed(0)} KB`;
}

type ApplicationAttachmentsPanelProps = {
  applicationId: string;
  readOnly?: boolean;
  initialItems?: ApplicationAttachment[];
};

export function ApplicationAttachmentsPanel({
  applicationId,
  readOnly = false,
  initialItems,
}: ApplicationAttachmentsPanelProps) {
  const [items, setItems] = useState<ApplicationAttachment[]>(initialItems ?? []);
  const [loading, setLoading] = useState(!readOnly && initialItems === undefined);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (readOnly && initialItems) {
      setItems(initialItems);
      setLoading(false);
      return;
    }

    setError(null);
    const result = await fetchApplicationAttachments(applicationId);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load attachments");
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

  useEffect(() => {
    if (!previewId) {
      setPreviewUrl(null);
      return;
    }
    const attachment = items.find((a) => a.id === previewId);
    if (!attachment || attachment.mimeType !== "application/pdf") {
      setPreviewUrl(null);
      return;
    }

    let revoked: string | null = null;
    void fetchAttachmentBlobUrl(previewId, true).then((url) => {
      if (url) {
        revoked = url;
        setPreviewUrl(url);
      }
    });

    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [previewId, items]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setError("Choose a file to upload");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await uploadApplicationAttachment(applicationId, selectedFile, notes.trim() || undefined);

    setSaving(false);

    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not upload file");
      return;
    }

    if ("attachment" in result) {
      setItems((prev) => [result.attachment, ...prev]);
      setNotes("");
      setSelectedFile(null);
      setShowForm(false);
    }
  }

  async function handleDownload(attachment: ApplicationAttachment) {
    const url = await fetchAttachmentBlobUrl(attachment.id, false);
    if (!url) {
      setError("Could not download file");
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = attachment.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(attachmentId: string) {
    if (!window.confirm("Delete this attachment?")) return;
    const err = await deleteApplicationAttachment(applicationId, attachmentId);
    if (err?.error) {
      setError(err.error.message ?? "Could not delete attachment");
      return;
    }
    setItems((prev) => prev.filter((a) => a.id !== attachmentId));
    if (previewId === attachmentId) setPreviewId(null);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Attachments</h4>
          <p className="mt-1 text-sm text-zinc-500">
            {readOnly
              ? "Files the applicant attached to this application."
              : "Extra files for this application. Your profile resume is managed in Settings."}
          </p>
        </div>
        {!readOnly ? (
          <Button type="button" variant="secondary" size="xs" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "Upload file"}
          </Button>
        ) : null}
      </div>

      {!readOnly && showForm ? (
        <form
          noValidate
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-4 space-y-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/40"
        >
          <div>
            <label htmlFor="attachment-file" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              File
            </label>
            <input
              id="attachment-file"
              name="attachment-file"
              type="file"
              accept=".pdf,.docx,image/png,image/jpeg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="mt-1.5 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-500 dark:text-zinc-400"
            />
            <p className="mt-1 text-xs text-zinc-500">PDF, DOCX, PNG, or JPEG up to 5 MB.</p>
          </div>
          <div>
            <label htmlFor="attachment-notes" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Notes (optional)
            </label>
            <input
              id="attachment-notes"
              maxLength={4000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={fieldClass}
              placeholder="Cover letter draft, portfolio PDF…"
            />
          </div>
          <Button type="submit" variant="success" size="sm" disabled={saving}>
            {saving ? "Uploading…" : "Upload"}
          </Button>
        </form>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {loading ? (
        <p className="mt-3 text-sm text-zinc-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No attachments yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.filename}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatSize(row.sizeBytes)} · uploaded {formatDate(row.createdAt)}
                  </p>
                  {row.notes ? (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{row.notes}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.mimeType === "application/pdf" ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={() => setPreviewId((id) => (id === row.id ? null : row.id))}
                    >
                      {previewId === row.id ? "Hide preview" : "Preview"}
                    </Button>
                  ) : null}
                  <Button type="button" variant="secondary" size="xs" onClick={() => void handleDownload(row)}>
                    Download
                  </Button>
                  {!readOnly ? (
                    <Button type="button" variant="ghost" size="xs" onClick={() => void handleDelete(row.id)}>
                      Delete
                    </Button>
                  ) : null}
                </div>
              </div>
              {previewId === row.id && previewUrl ? (
                <iframe
                  title={`Preview ${row.filename}`}
                  src={previewUrl}
                  className="mt-4 h-96 w-full rounded-xl border border-zinc-200 dark:border-zinc-700"
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
