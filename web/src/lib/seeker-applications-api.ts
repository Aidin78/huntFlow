import type { ApiErrorBody, JobApplicationStatus } from "@huntflow/contracts";

import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";
import type {
  EmployerApplicationDetailResponse,
  UpdateApplicationStatusResponse,
} from "@/lib/employer-applications-api";
import type { SeekerTagSummary } from "@/lib/seeker-tags-api";

export type SeekerApplicationDetailResponse = EmployerApplicationDetailResponse;

export type { StatusHistoryEvent } from "@/lib/employer-applications-api";

export type { JobApplicationStatus };
export type { ApiErrorBody };

export type SeekerManualStatus = Exclude<JobApplicationStatus, "DRAFT">;

export type SeekerApplication = {
  id: string;
  title: string;
  status: JobApplicationStatus;
  appliedAt: string | null;
  location: string | null;
  salaryText: string | null;
  notes: string | null;
  isManual: boolean;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string };
  jobListing: { id: string; title: string } | null;
  tags: SeekerTagSummary[];
};

export type SeekerApplicationsResponse = {
  items: SeekerApplication[];
  statusCounts: Record<string, number>;
};

export type CreateManualApplicationInput = {
  title: string;
  companyName: string;
  appliedAt?: string;
  location?: string;
  salaryText?: string;
  notes?: string;
  sourceUrl?: string;
};

export type CreateManualApplicationResponse = {
  application: {
    id: string;
    title: string;
    status: JobApplicationStatus;
    appliedAt: string | null;
    location: string | null;
    salaryText: string | null;
    notes: string | null;
    isManual: true;
    company: { id: string; name: string };
  };
};

export type UpdateManualApplicationInput = {
  title?: string;
  companyName?: string;
  appliedAt?: string | null;
  location?: string | null;
  salaryText?: string | null;
  notes?: string | null;
  sourceUrl?: string | null;
};

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchSeekerApplicationDetail(
  id: string,
): Promise<SeekerApplicationDetailResponse | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as SeekerApplicationDetailResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function fetchSeekerApplications(): Promise<
  SeekerApplicationsResponse | ApiErrorBody
> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/applications`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as SeekerApplicationsResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function createManualApplication(
  body: CreateManualApplicationInput,
): Promise<CreateManualApplicationResponse | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/applications`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as CreateManualApplicationResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function updateManualApplication(
  id: string,
  patch: UpdateManualApplicationInput,
): Promise<{ application: { id: string; title: string; updatedAt: string } } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as
    | { application: { id: string; title: string; updatedAt: string } }
    | ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function updateSeekerApplicationStatus(
  id: string,
  status: SeekerManualStatus,
): Promise<UpdateApplicationStatusResponse | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  const data = (await res.json()) as UpdateApplicationStatusResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function archiveSeekerApplication(
  id: string,
): Promise<UpdateApplicationStatusResponse | ApiErrorBody> {
  return updateSeekerApplicationStatus(id, "ARCHIVED");
}

export async function updateApplicationResume(
  applicationId: string,
  resumeFileId: string | null,
): Promise<{ resumeFileId: string | null } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/resume`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ resumeFileId }),
    },
  );
  const data = (await res.json()) as { resumeFileId: string | null } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function uploadApplicationResume(
  applicationId: string,
  file: File,
): Promise<{ resumeFileId: string; resume: import("@huntflow/contracts").UserFileMeta } | ApiErrorBody> {
  const form = new FormData();
  form.append("resume", file);
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/resume`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: form,
    },
  );
  const data = (await res.json()) as {
    resumeFileId: string;
    resume: import("@huntflow/contracts").UserFileMeta;
  } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export function applicationStatusLabel(status: JobApplicationStatus): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "APPLIED":
      return "Applied";
    case "INTERVIEW":
      return "Interview";
    case "OFFER":
      return "Offer";
    case "REJECTED":
      return "Rejected";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

export function applicationStatusClass(status: JobApplicationStatus): string {
  switch (status) {
    case "INTERVIEW":
      return "bg-violet-500/12 text-violet-800 ring-violet-500/20 dark:text-violet-200";
    case "OFFER":
      return "bg-emerald-500/12 text-emerald-800 ring-emerald-500/20 dark:text-emerald-200";
    case "REJECTED":
      return "bg-red-500/10 text-red-800 ring-red-500/20 dark:text-red-300";
    case "ARCHIVED":
      return "bg-zinc-500/10 text-zinc-600 ring-zinc-500/15 dark:text-zinc-400";
    default:
      return "bg-sky-500/12 text-sky-800 ring-sky-500/20 dark:text-sky-200";
  }
}
