"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchAuthenticatedFileBlobUrl } from "@/lib/authenticated-file";
import {
  fetchSeekerProfile,
  type UserFileMeta,
} from "@/lib/seeker-profile-api";
import {
  updateApplicationResume,
  uploadApplicationResume,
} from "@/lib/seeker-applications-api";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type ApplicationResumePanelProps = {
  applicationId: string;
  initialResume: UserFileMeta | null | undefined;
  onResumeChange?: (resume: UserFileMeta | null) => void;
};

export function ApplicationResumePanel({
  applicationId,
  initialResume,
  onResumeChange,
}: ApplicationResumePanelProps) {
  const [resume, setResume] = useState<UserFileMeta | null | undefined>(initialResume);
  const [profileResume, setProfileResume] = useState<UserFileMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setResume(initialResume);
  }, [initialResume]);

  useEffect(() => {
    void fetchSeekerProfile().then((result) => {
      if ("profile" in result && result.profile?.resume) {
        setProfileResume(result.profile.resume);
      }
    });
  }, []);

  useEffect(() => {
    if (!resume || resume.mimeType !== "application/pdf") {
      setPreviewUrl(null);
      return;
    }
    let revoked: string | null = null;
    void fetchAuthenticatedFileBlobUrl(resume.id, true).then((url) => {
      if (url) {
        revoked = url;
        setPreviewUrl(url);
      }
    });
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [resume]);

  const applyResume = useCallback(
    (next: UserFileMeta | null) => {
      setResume(next);
      onResumeChange?.(next);
    },
    [onResumeChange],
  );

  async function useProfileResume() {
    if (!profileResume) return;
    setSaving(true);
    setError(null);
    const result = await updateApplicationResume(applicationId, profileResume.id);
    setSaving(false);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not update resume");
      return;
    }
    if ("resumeFileId" in result) {
      applyResume(profileResume);
    }
  }

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setSaving(true);
    setError(null);
    const result = await uploadApplicationResume(applicationId, file);
    setSaving(false);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not upload resume");
      return;
    }
    if ("resume" in result) {
      applyResume(result.resume);
      setProfileResume(result.resume);
    }
  }

  async function handleDownload() {
    if (!resume) return;
    const url = await fetchAuthenticatedFileBlobUrl(resume.id, false);
    if (!url) {
      setError("Could not download resume");
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = resume.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Resume</h4>
          <p className="mt-1 text-sm text-zinc-500">The resume submitted with this application.</p>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {resume ? (
        <div className="mt-3 rounded-2xl border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/30">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{resume.filename}</p>
          <p className="mt-1 text-sm text-zinc-500">
            {(resume.sizeBytes / 1024).toFixed(0)} KB · uploaded {formatDate(resume.createdAt)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => void handleDownload()}>
              Download
            </Button>
            {profileResume && profileResume.id !== resume.id ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={saving}
                onClick={() => void useProfileResume()}
              >
                Use profile resume
              </Button>
            ) : null}
            <label className="inline-block">
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                disabled={saving}
                onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
              />
              <span className="inline-flex min-h-9 cursor-pointer items-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500">
                {saving ? "Saving…" : "Upload different resume"}
              </span>
            </label>
          </div>
          {previewUrl ? (
            <iframe
              title="Resume preview"
              src={previewUrl}
              className="mt-4 h-96 w-full rounded-xl border border-zinc-200 dark:border-zinc-700"
            />
          ) : null}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-zinc-500">No resume attached to this application.</p>
          {profileResume ? (
            <Button type="button" variant="secondary" size="sm" disabled={saving} onClick={() => void useProfileResume()}>
              Attach profile resume
            </Button>
          ) : null}
          <label className="inline-block">
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              disabled={saving}
              onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
            />
            <span className="inline-flex min-h-9 cursor-pointer items-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500">
              {saving ? "Uploading…" : "Upload resume"}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
