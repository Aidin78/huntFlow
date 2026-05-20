"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  deleteSeekerResume,
  fetchSeekerProfile,
  saveSeekerProfile,
  uploadSeekerResume,
  type SeekerProfile,
  type SeekerProfileInput,
} from "@/lib/seeker-profile-api";

const fieldClass =
  "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

function profileToInput(profile: SeekerProfile | null): SeekerProfileInput {
  return {
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
    portfolioUrl: profile?.portfolioUrl ?? "",
    githubUrl: profile?.githubUrl ?? "",
  };
}

export function SeekerProfileForm() {
  const [profile, setProfile] = useState<SeekerProfile | null>(null);
  const [form, setForm] = useState<SeekerProfileInput>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchSeekerProfile();
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load profile");
      setLoading(false);
      return;
    }
    if ("profile" in result) {
      setProfile(result.profile);
      setForm(profileToInput(result.profile));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    const result = await saveSeekerProfile({
      headline: form.headline?.trim() || undefined,
      bio: form.bio?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      location: form.location?.trim() || undefined,
      linkedinUrl: form.linkedinUrl?.trim() || undefined,
      portfolioUrl: form.portfolioUrl?.trim() || undefined,
      githubUrl: form.githubUrl?.trim() || undefined,
    });
    setSaving(false);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not save profile");
      return;
    }
    if ("profile" in result) {
      setProfile(result.profile);
      setForm(profileToInput(result.profile));
    }
    setSuccess("Profile saved.");
  }

  async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    const result = await uploadSeekerResume(file);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not upload resume");
      return;
    }
    if ("resume" in result) {
      setProfile((p) => (p ? { ...p, resume: result.resume } : null));
      setSuccess("Resume uploaded.");
    }
    void load();
  }

  async function handleRemoveResume() {
    setUploading(true);
    setError(null);
    const err = await deleteSeekerResume();
    setUploading(false);
    if (err?.error) {
      setError(err.error.message ?? "Could not remove resume");
      return;
    }
    setProfile((p) => (p ? { ...p, resume: null } : null));
    setSuccess("Resume removed.");
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading profile…</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={(e) => void handleSave(e)} className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/60">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Profile</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Employers see this when you apply. Your resume is attached automatically if uploaded.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="headline" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Headline
            </label>
            <input
              id="headline"
              value={form.headline ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              maxLength={200}
              className={fieldClass}
              placeholder="e.g. Senior backend engineer · Berlin"
            />
          </div>
          <div>
            <label htmlFor="location" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Location
            </label>
            <input
              id="location"
              value={form.location ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              maxLength={120}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Phone
            </label>
            <input
              id="phone"
              value={form.phone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              maxLength={40}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              About
            </label>
            <textarea
              id="bio"
              value={form.bio ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={5}
              maxLength={4000}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="linkedinUrl" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              LinkedIn URL
            </label>
            <input
              id="linkedinUrl"
              type="url"
              value={form.linkedinUrl ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="portfolioUrl" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Portfolio URL
            </label>
            <input
              id="portfolioUrl"
              type="url"
              value={form.portfolioUrl ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, portfolioUrl: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="githubUrl" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              GitHub URL
            </label>
            <input
              id="githubUrl"
              type="url"
              value={form.githubUrl ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
              className={fieldClass}
            />
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">{success}</p> : null}

        <Button type="submit" className="mt-6" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>

      <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/60">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Resume</h3>
        <p className="mt-1 text-xs text-zinc-500">PDF or DOCX, max 5 MB. Included when you apply.</p>

        {profile?.resume ? (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950/50">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profile.resume.filename}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {(profile.resume.sizeBytes / 1024).toFixed(0)} KB
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploading}
                onClick={() => void handleRemoveResume()}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-zinc-500">No resume on file.</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Upload resume"}
            </Button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(e) => void handleResumeChange(e)}
        />
      </section>
    </div>
  );
}
