import type { ApiErrorBody, UserFileMeta } from "@huntflow/contracts";

import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export type { UserFileMeta };
export type { ApiErrorBody };

export type SeekerProfile = {
  userId: string;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  resume: UserFileMeta | null;
};

export type SeekerProfileInput = {
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
};

function authHeaders(json = true): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  const headers: HeadersInit = { Authorization: `Bearer ${token}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

export function fileDownloadUrl(path: string, inline = false): string {
  const base = getPublicApiBaseUrl();
  const q = inline ? "?inline=1" : "";
  return `${base}${path}${q}`;
}

export async function fetchSeekerProfile(): Promise<{ profile: SeekerProfile | null } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/profile`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as { profile: SeekerProfile | null } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function saveSeekerProfile(
  input: SeekerProfileInput,
): Promise<{ profile: SeekerProfile | null } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as { profile: SeekerProfile | null } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function uploadSeekerResume(file: File): Promise<{ resume: UserFileMeta } | ApiErrorBody> {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  const form = new FormData();
  form.append("resume", file);
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/resume`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = (await res.json()) as { resume: UserFileMeta } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function deleteSeekerResume(): Promise<ApiErrorBody | null> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/resume`, {
    method: "DELETE",
    headers: authHeaders(false),
  });
  if (res.status === 204) return null;
  return (await res.json()) as ApiErrorBody;
}
