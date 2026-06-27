import type { ApplicationLink, ApiErrorBody } from "@huntflow/contracts";

import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export type { ApplicationLink };
export type { ApiErrorBody };

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchApplicationLinks(
  applicationId: string,
): Promise<{ items: ApplicationLink[] } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/links`,
    { headers: authHeaders(), cache: "no-store" },
  );
  const data = (await res.json()) as { items: ApplicationLink[] } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export type CreateLinkInput = {
  label?: string;
  url: string;
};

export async function createLink(
  applicationId: string,
  body: CreateLinkInput,
): Promise<{ link: ApplicationLink } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/links`,
    {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = (await res.json()) as { link: ApplicationLink } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export type UpdateLinkInput = {
  label?: string | null;
  url?: string;
};

export async function updateLink(
  applicationId: string,
  linkId: string,
  body: UpdateLinkInput,
): Promise<{ link: ApplicationLink } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/links/${encodeURIComponent(linkId)}`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = (await res.json()) as { link: ApplicationLink } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function deleteLink(
  applicationId: string,
  linkId: string,
): Promise<ApiErrorBody | null> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/links/${encodeURIComponent(linkId)}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (res.ok) return null;
  return (await res.json()) as ApiErrorBody;
}
