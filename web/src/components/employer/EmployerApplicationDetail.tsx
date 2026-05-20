"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ApplicationMessagesPanel } from "@/components/applications/ApplicationMessagesPanel";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { ActionLink, LinkButton } from "@/components/ui/button";
import { fetchAuthenticatedFileBlobUrl } from "@/lib/authenticated-file";
import {
  applicationStatusClass,
  applicationStatusLabel,
  fetchEmployerApplicationDetail,
  type EmployerApplicationDetailResponse,
} from "@/lib/employer-applications-api";
import { workArrangementLabel } from "@/lib/job-listings-api";

type TabId = "applicant" | "application" | "messages";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function applicantDisplayName(data: EmployerApplicationDetailResponse): string {
  return data.applicant.name?.trim() || data.applicant.email;
}

export function EmployerApplicationDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [data, setData] = useState<EmployerApplicationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("applicant");
  const [resumeBlobUrl, setResumeBlobUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    const result = await fetchEmployerApplicationDetail(id);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load application");
      setLoading(false);
      return;
    }
    if ("application" in result) {
      setData(result);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let revoked: string | null = null;
    setResumeBlobUrl(null);
    const fileId = data?.resume?.id;
    if (!fileId) return;

    void fetchAuthenticatedFileBlobUrl(fileId, true).then((url) => {
      if (url) {
        revoked = url;
        setResumeBlobUrl(url);
      }
    });

    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [data?.resume?.id]);

  if (loading) {
    return <p className="p-8 text-sm text-zinc-500">Loading application…</p>;
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? "Application not found"}</p>
        <LinkButton href="/dashboard/employer/applications" variant="secondary" className="mt-4">
          Back to applications
        </LinkButton>
      </div>
    );
  }

  const profile = data.applicant.profile;
  const tabs: { id: TabId; label: string }[] = [
    { id: "applicant", label: "Applicant" },
    { id: "application", label: "Application" },
    { id: "messages", label: `Messages${data.messaging.messageCount ? ` (${data.messaging.messageCount})` : ""}` },
  ];

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <Link
        href="/dashboard/employer/applications"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to applications
      </Link>

      <DashboardPageHeader
        badge="Application"
        title={applicantDisplayName(data)}
        subtitle={data.application.title}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "applicant" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/60">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Profile</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500">Email</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">{data.applicant.email}</dd>
              </div>
              {profile?.headline ? (
                <div>
                  <dt className="text-zinc-500">Headline</dt>
                  <dd className="text-zinc-800 dark:text-zinc-200">{profile.headline}</dd>
                </div>
              ) : null}
              {profile?.location ? (
                <div>
                  <dt className="text-zinc-500">Location</dt>
                  <dd>{profile.location}</dd>
                </div>
              ) : null}
              {profile?.phone ? (
                <div>
                  <dt className="text-zinc-500">Phone</dt>
                  <dd>{profile.phone}</dd>
                </div>
              ) : null}
              {profile?.bio ? (
                <div>
                  <dt className="text-zinc-500">About</dt>
                  <dd className="leading-relaxed text-zinc-700 dark:text-zinc-300">{profile.bio}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile?.linkedinUrl ? (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-sky-700 hover:underline dark:text-sky-400"
                >
                  LinkedIn
                </a>
              ) : null}
              {profile?.portfolioUrl ? (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-sky-700 hover:underline dark:text-sky-400"
                >
                  Portfolio
                </a>
              ) : null}
              {profile?.githubUrl ? (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-sky-700 hover:underline dark:text-sky-400"
                >
                  GitHub
                </a>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/60">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Resume</h3>
            {data.resume ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{data.resume.filename}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {(data.resume.sizeBytes / 1024).toFixed(0)} KB · uploaded{" "}
                  {formatDate(data.resume.createdAt)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void (async () => {
                        const url = await fetchAuthenticatedFileBlobUrl(data.resume!.id, false);
                        if (url) {
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = data.resume!.filename;
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                      })();
                    }}
                    className="inline-flex rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Download
                  </button>
                </div>
                {resumeBlobUrl && data.resume.mimeType === "application/pdf" ? (
                  <iframe
                    title="Resume preview"
                    src={resumeBlobUrl}
                    className="mt-4 h-[480px] w-full rounded-xl border border-zinc-200 dark:border-zinc-700"
                  />
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">No resume attached to this application.</p>
            )}
          </section>
        </div>
      ) : null}

      {tab === "application" ? (
        <section className="max-w-3xl rounded-3xl border border-zinc-200/80 bg-white/90 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${applicationStatusClass(data.application.status)}`}
            >
              {applicationStatusLabel(data.application.status)}
            </span>
            <span className="text-sm text-zinc-500">Applied {formatDate(data.application.appliedAt)}</span>
          </div>
          {data.jobListing ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Posting:{" "}
              <ActionLink href={`/jobs/${data.jobListing.id}`} actionVariant="link">
                {data.jobListing.title}
              </ActionLink>
              {data.jobListing.city ? ` · ${data.jobListing.city}` : ""}
              {" · "}
              {workArrangementLabel(
                data.jobListing.workArrangement as "REMOTE" | "HYBRID" | "ONSITE",
              )}
            </p>
          ) : null}
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-500">Cover letter</h3>
          {data.application.coverLetter ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
              {data.application.coverLetter}
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No cover letter provided.</p>
          )}
        </section>
      ) : null}

      {tab === "messages" ? (
        <ApplicationMessagesPanel applicationId={data.application.id} audience="employer" active={tab === "messages"} />
      ) : null}
    </div>
  );
}
