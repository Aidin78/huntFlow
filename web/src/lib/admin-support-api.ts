import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export type SupportInquiryStatus = "OPEN" | "RESOLVED";

export type SupportInquiryListItem = {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: SupportInquiryStatus;
  createdAt: string;
  resolvedAt: string | null;
};

export type SupportInquiryDetail = SupportInquiryListItem & {
  message: string;
  adminNotes: string | null;
  emailSent: boolean;
  user: { id: string; email: string; name: string | null; role: string } | null;
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchSupportInquiries(query: {
  status?: SupportInquiryStatus;
  q?: string;
  cursor?: string;
  limit?: number;
} = {}): Promise<
  { items: SupportInquiryListItem[]; nextCursor: string | null; hasMore: boolean } | ApiErrorBody
> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.q) params.set("q", query.q);
  if (query.cursor) params.set("cursor", query.cursor);
  if (query.limit) params.set("limit", String(query.limit));

  const qs = params.toString();
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/admin/support-inquiries${qs ? `?${qs}` : ""}`,
    { headers: authHeaders(), cache: "no-store" },
  );
  const data = (await res.json()) as {
    items: SupportInquiryListItem[];
    nextCursor: string | null;
    hasMore: boolean;
  } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function fetchSupportInquiry(
  id: string,
): Promise<{ inquiry: SupportInquiryDetail } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/admin/support-inquiries/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as { inquiry: SupportInquiryDetail } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function updateSupportInquiry(
  id: string,
  body: { status?: SupportInquiryStatus; adminNotes?: string | null },
): Promise<{ inquiry: SupportInquiryDetail } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/admin/support-inquiries/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { inquiry: SupportInquiryDetail } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}
