import type { ApplicationAttachment, ApiErrorBody } from "@huntflow/contracts";

import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export type { ApplicationAttachment };
export type { ApiErrorBody };

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchApplicationAttachments(
  applicationId: string,
): Promise<{ items: ApplicationAttachment[] } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/attachments`,
    { headers: authHeaders(), cache: "no-store" },
  );
  const data = (await res.json()) as { items: ApplicationAttachment[] } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function uploadApplicationAttachment(
  applicationId: string,
  file: File,
  notes?: string,
): Promise<{ attachment: ApplicationAttachment } | ApiErrorBody> {
  const form = new FormData();
  form.append("file", file);
  if (notes?.trim()) {
    form.append("notes", notes.trim());
  }

  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/attachments`,
    {
      method: "POST",
      headers: authHeaders(),
      body: form,
    },
  );
  const data = (await res.json()) as { attachment: ApplicationAttachment } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function deleteApplicationAttachment(
  applicationId: string,
  attachmentId: string,
): Promise<ApiErrorBody | null> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/attachments/${encodeURIComponent(attachmentId)}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (res.ok) return null;
  return (await res.json()) as ApiErrorBody;
}
