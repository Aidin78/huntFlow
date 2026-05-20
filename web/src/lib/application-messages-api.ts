import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export type MessageSender = {
  id: string;
  name: string | null;
  email: string;
  role: "JOB_SEEKER" | "EMPLOYER";
};

export type ApplicationMessage = {
  id: string;
  body: string;
  createdAt: string;
  sender: MessageSender;
};

export type MessagesResponse = {
  threadId: string;
  items: ApplicationMessage[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

type Audience = "employer" | "seeker";

function basePath(audience: Audience, applicationId: string): string {
  const prefix = audience === "employer" ? "employer" : "seeker";
  return `${getPublicApiBaseUrl()}/api/${prefix}/applications/${encodeURIComponent(applicationId)}/messages`;
}

export async function fetchApplicationMessages(
  audience: Audience,
  applicationId: string,
  opts?: { cursor?: string; limit?: number },
): Promise<MessagesResponse | ApiErrorBody> {
  const params = new URLSearchParams();
  if (opts?.cursor) params.set("cursor", opts.cursor);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  const res = await fetch(`${basePath(audience, applicationId)}${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as MessagesResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function sendApplicationMessage(
  audience: Audience,
  applicationId: string,
  body: string,
): Promise<{ item: ApplicationMessage } | ApiErrorBody> {
  const res = await fetch(basePath(audience, applicationId), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ body }),
  });
  const data = (await res.json()) as { item: ApplicationMessage } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}
