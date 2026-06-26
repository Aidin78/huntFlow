import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export type NotificationType =
  | "MESSAGE"
  | "NEW_APPLICATION"
  | "STATUS_EVENT"
  | "REMINDER_DUE"
  | "INTERVIEW_UPCOMING";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  createdAt: string;
  readAt: string | null;
  jobApplicationId: string | null;
  href: string | null;
  actor: { id: string; name: string | null; email: string } | null;
};

export type NotificationsResponse = {
  items: NotificationItem[];
  unreadCount: number;
  nextCursor: string | null;
  hasMore: boolean;
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchNotifications(): Promise<NotificationsResponse | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/notifications?limit=15`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as NotificationsResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function markNotificationRead(id: string): Promise<{ ok: true } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = (await res.json()) as { ok: true } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function markAllNotificationsRead(): Promise<{ ok: true } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/notifications/read-all`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = (await res.json()) as { ok: true } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}
