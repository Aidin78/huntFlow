import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";
import type { JobApplicationStatus } from "@/lib/seeker-applications-api";
import type { JobListingLifecycle } from "@/lib/employer-job-listings-api";

export type EmployerOverviewStats = {
  publishedPostings: number;
  draftPostings: number;
  totalApplications: number;
  awaitingReview: number;
  inPipeline: number;
};

export type EmployerOverviewPosting = {
  id: string;
  title: string;
  status: JobListingLifecycle;
  applicantCount: number;
  location: string | null;
  updatedAt: string;
};

export type EmployerOverviewApplication = {
  id: string;
  title: string;
  status: JobApplicationStatus;
  appliedAt: string | null;
  applicant: { name: string | null; email: string };
};

export type EmployerOverviewResponse = {
  stats: EmployerOverviewStats;
  recentPostings: EmployerOverviewPosting[];
  recentApplications: EmployerOverviewApplication[];
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchEmployerOverview(): Promise<EmployerOverviewResponse | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/employer/overview`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as EmployerOverviewResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}
