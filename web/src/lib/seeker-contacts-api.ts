import type { ApplicationContact, ApiErrorBody } from "@huntflow/contracts";

import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export type { ApplicationContact };
export type { ApiErrorBody };

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchApplicationContacts(
  applicationId: string,
): Promise<{ items: ApplicationContact[] } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/contacts`,
    { headers: authHeaders(), cache: "no-store" },
  );
  const data = (await res.json()) as { items: ApplicationContact[] } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export type CreateContactInput = {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  notes?: string;
  role?: string;
};

export async function createContact(
  applicationId: string,
  body: CreateContactInput,
): Promise<{ contact: ApplicationContact } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/contacts`,
    {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = (await res.json()) as { contact: ApplicationContact } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export type UpdateContactInput = {
  name?: string;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  notes?: string | null;
  role?: string | null;
};

export async function updateContact(
  applicationId: string,
  contactId: string,
  body: UpdateContactInput,
): Promise<{ contact: ApplicationContact } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/contacts/${encodeURIComponent(contactId)}`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = (await res.json()) as { contact: ApplicationContact } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function deleteContact(
  applicationId: string,
  contactId: string,
): Promise<ApiErrorBody | null> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/contacts/${encodeURIComponent(contactId)}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (res.ok) return null;
  return (await res.json()) as ApiErrorBody;
}
