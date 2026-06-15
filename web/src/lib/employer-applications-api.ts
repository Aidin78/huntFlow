import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";
import type { UserFileMeta } from "@/lib/seeker-profile-api";
import {
  applicationStatusClass,
  applicationStatusLabel,
  type JobApplicationStatus,
} from "@/lib/seeker-applications-api";

export type { JobApplicationStatus };
export { applicationStatusClass, applicationStatusLabel };

export type EmployerApplicationJobOption = {
  id: string;
  title: string;
  applicantCount: number;
};

export type EmployerApplication = {
  id: string;
  title: string;
  status: JobApplicationStatus;
  appliedAt: string | null;
  coverLetter?: string | null;
  location: string | null;
  salaryText: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  jobListing: { id: string; title: string } | null;
};

export type SeekerProfilePublic = {
  headline: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
} | null;

export type StatusHistoryEvent = {
  from: string | null;
  to: string;
  at: string;
  note: string | null;
};

export type EmployerApplicationDetailResponse = {
  application: {
    id: string;
    title: string;
    status: JobApplicationStatus;
    appliedAt: string | null;
    coverLetter: string | null;
    location: string | null;
    salaryText: string | null;
    createdAt: string;
    updatedAt: string;
  };
  applicant: {
    id: string;
    name: string | null;
    email: string;
    profile: SeekerProfilePublic;
  };
  jobListing: {
    id: string;
    title: string;
    city: string | null;
    workArrangement: string;
    experienceLevel: string;
  } | null;
  resume: UserFileMeta | null;
  messaging: {
    messageCount: number;
    lastMessage: { body: string; createdAt: string; senderName: string } | null;
  };
  statusHistory: StatusHistoryEvent[];
};

export type EmployerApplicationsQuery = {
  jobListingId?: string;
  cursor?: string;
  limit?: number;
};

export type EmployerApplicationsResponse = {
  items: EmployerApplication[];
  nextCursor: string | null;
  hasMore: boolean;
  jobListings?: EmployerApplicationJobOption[];
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchEmployerApplications(
  query: EmployerApplicationsQuery = {},
): Promise<EmployerApplicationsResponse | ApiErrorBody> {
  const params = new URLSearchParams();
  if (query.jobListingId) params.set("jobListingId", query.jobListingId);
  if (query.cursor) params.set("cursor", query.cursor);
  if (query.limit) params.set("limit", String(query.limit));

  const qs = params.toString();
  const res = await fetch(`${getPublicApiBaseUrl()}/api/employer/applications${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as EmployerApplicationsResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function fetchEmployerApplicationDetail(
  id: string,
): Promise<EmployerApplicationDetailResponse | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/employer/applications/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as EmployerApplicationDetailResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export type UpdateEmployerApplicationStatusBody = {
  status: Extract<JobApplicationStatus, "INTERVIEW" | "OFFER" | "REJECTED">;
  note?: string;
};

export type UpdateApplicationStatusResponse = {
  application: { id: string; status: JobApplicationStatus; updatedAt: string };
  event: StatusHistoryEvent;
};

export async function updateEmployerApplicationStatus(
  id: string,
  body: UpdateEmployerApplicationStatusBody,
): Promise<UpdateApplicationStatusResponse | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/employer/applications/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = (await res.json()) as UpdateApplicationStatusResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}
