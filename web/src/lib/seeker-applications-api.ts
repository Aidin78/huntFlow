import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";
import type {
  EmployerApplicationDetailResponse,
  UpdateApplicationStatusResponse,
} from "@/lib/employer-applications-api";

export type SeekerApplicationDetailResponse = EmployerApplicationDetailResponse;

export type { StatusHistoryEvent } from "@/lib/employer-applications-api";

export type JobApplicationStatus =
  | "DRAFT"
  | "APPLIED"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "ARCHIVED";

export type SeekerApplication = {
  id: string;
  title: string;
  status: JobApplicationStatus;
  appliedAt: string | null;
  location: string | null;
  salaryText: string | null;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string };
  jobListing: { id: string; title: string } | null;
};

export type SeekerApplicationsResponse = {
  items: SeekerApplication[];
  statusCounts: Record<string, number>;
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
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

export async function archiveSeekerApplication(
  id: string,
): Promise<UpdateApplicationStatusResponse | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ARCHIVED" }),
    },
  );
  const data = (await res.json()) as UpdateApplicationStatusResponse & ApiErrorBody;
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
