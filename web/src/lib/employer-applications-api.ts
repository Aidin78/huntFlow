import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";
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
  location: string | null;
  salaryText: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  jobListing: { id: string; title: string } | null;
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
