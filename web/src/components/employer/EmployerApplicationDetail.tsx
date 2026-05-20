"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ApplicationMessagesPanel } from "@/components/applications/ApplicationMessagesPanel";
import { BackLink } from "@/components/dashboard/BackLink";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { LocationIcon, PhoneIcon, SocialLinks } from "@/components/dashboard/dashboard-ui";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { ActionLink, Button, LinkButton } from "@/components/ui/button";
import { fetchAuthenticatedFileBlobUrl } from "@/lib/authenticated-file";
import {
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
    return (
      <div className="p-8">
        <div className="h-32 animate-pulse rounded-3xl bg-white/60 dark:bg-zinc-900/40" />
      </div>
    );
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
  const displayName = applicantDisplayName(data);

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <BackLink href="/dashboard/employer/applications">Back to applications</BackLink>

      <div className="mb-8 flex flex-col gap-5 rounded-3xl border border-zinc-200/80 bg-white/95 p-6 shadow-sm sm:flex-row sm:items-center dark:border-zinc-800/80 dark:bg-zinc-900/70">
        <UserAvatar name={displayName} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{displayName}</h1>
            <StatusBadge status={data.application.status} size="md" />
          </div>
          <p className="mt-1 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            {data.application.title}
          </p>
          <p className="mt-1 text-sm text-zinc-500">{data.applicant.email}</p>
        </div>
      </div>

      <DashboardTabs
        className="mb-8"
        active={tab}
        onChange={(id) => setTab(id as TabId)}
        tabs={[
          { id: "applicant", label: "Applicant" },
          { id: "application", label: "Application" },
          {
            id: "messages",
            label: "Messages",
            badge: data.messaging.messageCount || undefined,
          },
        ]}
      />

      {tab === "applicant" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardCard
            title="Profile"
            description="Contact details and links shared at apply time"
            icon={<ProfileIcon />}
            accent="sky"
          >
            <dl className="space-y-4 text-sm">
              {profile?.headline ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Headline</dt>
                  <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{profile.headline}</dd>
                </div>
              ) : null}
              {profile?.location ? (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <LocationIcon className="h-3.5 w-3.5" />
                    Location
                  </dt>
                  <dd className="mt-1">{profile.location}</dd>
                </div>
              ) : null}
              {profile?.phone ? (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <PhoneIcon className="h-3.5 w-3.5" />
                    Phone
                  </dt>
                  <dd className="mt-1">{profile.phone}</dd>
                </div>
              ) : null}
              {profile?.bio ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">About</dt>
                  <dd className="mt-1 leading-relaxed text-zinc-700 dark:text-zinc-300">{profile.bio}</dd>
                </div>
              ) : null}
            </dl>
            <SocialLinks
              linkedinUrl={profile?.linkedinUrl}
              portfolioUrl={profile?.portfolioUrl}
              githubUrl={profile?.githubUrl}
              className="mt-5"
            />
          </DashboardCard>

          <DashboardCard
            title="Resume"
            description="File submitted with this application"
            icon={<ResumeIcon />}
            accent="emerald"
          >
            {data.resume ? (
              <>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{data.resume.filename}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {(data.resume.sizeBytes / 1024).toFixed(0)} KB · uploaded {formatDate(data.resume.createdAt)}
                </p>
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  className="mt-4"
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
                >
                  Download resume
                </Button>
                {resumeBlobUrl && data.resume.mimeType === "application/pdf" ? (
                  <iframe
                    title="Resume preview"
                    src={resumeBlobUrl}
                    className="mt-4 h-[480px] w-full rounded-xl border border-zinc-200 dark:border-zinc-700"
                  />
                ) : null}
              </>
            ) : (
              <p className="text-sm text-zinc-500">No resume attached to this application.</p>
            )}
          </DashboardCard>
        </div>
      ) : null}

      {tab === "application" ? (
        <DashboardCard title="Application details" accent="violet" className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={data.application.status} size="md" />
            <span className="text-sm text-zinc-500">Applied {formatDate(data.application.appliedAt)}</span>
          </div>
          {data.jobListing ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
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
          <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">Cover letter</h4>
          {data.application.coverLetter ? (
            <div className="mt-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {data.application.coverLetter}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No cover letter provided.</p>
          )}
        </DashboardCard>
      ) : null}

      {tab === "messages" ? (
        <ApplicationMessagesPanel applicationId={data.application.id} audience="employer" active={tab === "messages"} />
      ) : null}
    </div>
  );
}
