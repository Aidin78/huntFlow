import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";
import type { ExperienceLevel, WorkArrangement } from "@/lib/job-listings-api";

export type JobListingLifecycle = "DRAFT" | "PUBLISHED" | "DEACTIVATED";

export type EmployerCompany = {
  id: string;
  name: string;
  tagline: string | null;
  website: string | null;
  linkedin: string | null;
  locations: string | null;
  about: string | null;
};

export type EmployerJobListing = {
  id: string;
  title: string;
  summary: string | null;
  city: string | null;
  workArrangement: WorkArrangement;
  experienceLevel: ExperienceLevel;
  salaryText: string | null;
  sourceUrl: string | null;
  publishedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  status: JobListingLifecycle;
  applicantCount: number;
};

export type JobListingFormInput = {
  title: string;
  summary?: string;
  city?: string;
  workArrangement: WorkArrangement;
  experienceLevel: ExperienceLevel;
  salaryText?: string;
  sourceUrl?: string;
};

export type CompanyFormInput = {
  name: string;
  tagline: string;
  about: string;
  website?: string;
  linkedin?: string;
  locations?: string;
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string; details?: unknown };
};

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not signed in");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function parseJson<T>(res: Response): Promise<T | ApiErrorBody> {
  const data = (await res.json()) as T & ApiErrorBody;
  if (!res.ok) {
    return data as ApiErrorBody;
  }
  return data;
}

export async function fetchEmployerCompany(): Promise<{ company: EmployerCompany | null } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/employer/company`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return parseJson<{ company: EmployerCompany | null }>(res);
}

export async function saveEmployerCompany(
  input: CompanyFormInput,
): Promise<{ company: EmployerCompany } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/employer/company`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  return parseJson<{ company: EmployerCompany }>(res);
}

export async function fetchEmployerJobListings(): Promise<
  { company: EmployerCompany | null; items: EmployerJobListing[] } | ApiErrorBody
> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/employer/job-listings`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  return parseJson<{ company: EmployerCompany | null; items: EmployerJobListing[] }>(res);
}

export async function createEmployerJobListing(
  input: JobListingFormInput,
): Promise<{ item: EmployerJobListing } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/employer/job-listings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  return parseJson<{ item: EmployerJobListing }>(res);
}

export async function updateEmployerJobListing(
  id: string,
  input: JobListingFormInput,
): Promise<{ item: EmployerJobListing } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/employer/job-listings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  return parseJson<{ item: EmployerJobListing }>(res);
}

export async function deleteEmployerJobListing(id: string): Promise<ApiErrorBody | null> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/employer/job-listings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 204) return null;
  return parseJson<ApiErrorBody>(res);
}

export async function publishEmployerJobListing(
  id: string,
): Promise<{ item: EmployerJobListing } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/employer/job-listings/${encodeURIComponent(id)}/publish`,
    { method: "POST", headers: authHeaders() },
  );
  return parseJson<{ item: EmployerJobListing }>(res);
}

export async function deactivateEmployerJobListing(
  id: string,
): Promise<{ item: EmployerJobListing } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/employer/job-listings/${encodeURIComponent(id)}/deactivate`,
    { method: "POST", headers: authHeaders() },
  );
  return parseJson<{ item: EmployerJobListing }>(res);
}

export function lifecycleLabel(status: JobListingLifecycle): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "PUBLISHED":
      return "Published";
    case "DEACTIVATED":
      return "Deactivated";
  }
}

export function lifecycleBadgeClass(status: JobListingLifecycle): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-500/12 text-emerald-800 ring-emerald-500/20 dark:text-emerald-200";
    case "DRAFT":
      return "bg-amber-500/12 text-amber-900 ring-amber-500/20 dark:text-amber-200";
    default:
      return "bg-zinc-500/10 text-zinc-600 ring-zinc-500/15 dark:text-zinc-400";
  }
}
