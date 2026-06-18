import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export const TAG_COLOR_PRESETS = [
  "#0d9488",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#64748b",
] as const;

export type TagColorPreset = (typeof TAG_COLOR_PRESETS)[number];

export type SeekerTagSummary = {
  id: string;
  name: string;
  color: string | null;
};

export type SeekerTag = SeekerTagSummary & {
  usageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchSeekerTags(): Promise<{ items: SeekerTag[] } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/tags`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as { items: SeekerTag[] } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function createSeekerTag(body: {
  name: string;
  color?: TagColorPreset;
}): Promise<{ tag: SeekerTag } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/tags`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { tag: SeekerTag } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function updateSeekerTag(
  tagId: string,
  patch: { name?: string; color?: TagColorPreset | null },
): Promise<{ tag: SeekerTag } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/tags/${encodeURIComponent(tagId)}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as { tag: SeekerTag } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function deleteSeekerTag(tagId: string): Promise<ApiErrorBody | void> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/tags/${encodeURIComponent(tagId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    return (await res.json()) as ApiErrorBody;
  }
}

export async function fetchApplicationTags(
  applicationId: string,
): Promise<{ items: SeekerTagSummary[] } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/tags`,
    { headers: authHeaders(), cache: "no-store" },
  );
  const data = (await res.json()) as { items: SeekerTagSummary[] } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function attachApplicationTag(
  applicationId: string,
  tagId: string,
): Promise<{ tag: SeekerTagSummary } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/tags`,
    {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    },
  );
  const data = (await res.json()) as { tag: SeekerTagSummary } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function attachApplicationTagByName(
  applicationId: string,
  body: { name: string; color?: TagColorPreset },
): Promise<{ tag: SeekerTagSummary } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/tags`,
    {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = (await res.json()) as { tag: SeekerTagSummary } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function detachApplicationTag(
  applicationId: string,
  tagId: string,
): Promise<ApiErrorBody | void> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/tags/${encodeURIComponent(tagId)}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok) {
    return (await res.json()) as ApiErrorBody;
  }
}

export async function replaceApplicationTags(
  applicationId: string,
  tagIds: string[],
): Promise<{ items: SeekerTagSummary[] } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/tags`,
    {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds }),
    },
  );
  const data = (await res.json()) as { items: SeekerTagSummary[] } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export function tagChipStyle(color: string | null): {
  backgroundColor: string;
  color: string;
  borderColor: string;
} {
  const base = color ?? "#64748b";
  return {
    backgroundColor: `${base}1a`,
    color: base,
    borderColor: `${base}40`,
  };
}
