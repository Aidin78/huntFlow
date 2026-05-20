"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { LocationIcon, PhoneIcon, SocialInput } from "@/components/dashboard/dashboard-ui";
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
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

function ProfileIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

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
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((n) => (
          <div key={n} className="h-64 animate-pulse rounded-3xl bg-white/60 dark:bg-zinc-900/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DashboardCard
        title="Profile"
        description="Employers see this when you apply. Your resume is attached automatically if uploaded."
        icon={<ProfileIcon />}
        accent="sky"
      >
        <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
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
            <label htmlFor="location" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <LocationIcon className="h-3.5 w-3.5" />
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
            <label htmlFor="phone" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <PhoneIcon className="h-3.5 w-3.5" />
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
              rows={4}
              maxLength={4000}
              className={fieldClass}
            />
          </div>

          <div className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Links & social</p>
            <SocialInput
              id="linkedinUrl"
              kind="linkedin"
              value={form.linkedinUrl ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, linkedinUrl: v }))}
            />
            <SocialInput
              id="portfolioUrl"
              kind="portfolio"
              value={form.portfolioUrl ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, portfolioUrl: v }))}
            />
            <SocialInput
              id="githubUrl"
              kind="github"
              value={form.githubUrl ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, githubUrl: v }))}
            />
          </div>

          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          {success ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              {success}
            </p>
          ) : null}

          <Button type="submit" variant="success" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </DashboardCard>

      <DashboardCard
        title="Resume"
        description="PDF or DOCX, max 5 MB. Included when you apply."
        icon={<ResumeIcon />}
        accent="emerald"
      >
        {profile?.resume ? (
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <ResumeIcon />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {profile.resume.filename}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {(profile.resume.sizeBytes / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
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
                variant="ghost"
                size="sm"
                disabled={uploading}
                onClick={() => void handleRemoveResume()}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
              <ResumeIcon />
            </span>
            <p className="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">No resume on file</p>
            <p className="mt-1 text-xs text-zinc-500">Upload a PDF or DOCX to attach it to applications.</p>
            <Button
              type="button"
              variant="success"
              size="sm"
              className="mt-4"
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
      </DashboardCard>
    </div>
  );
}
