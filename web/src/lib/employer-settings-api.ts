import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export type NotificationPreferences = {
  notifyNewApplication: boolean;
  notifyNewMessage: boolean;
  notifyInterviewReminder: boolean;
  notifyWeeklySummary: boolean;
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

export async function fetchEmployerNotificationPreferences(): Promise<
  NotificationPreferences | ApiErrorBody
> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/employer/notification-preferences`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as NotificationPreferences & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function updateEmployerNotificationPreferences(
  patch: Partial<
    Pick<
      NotificationPreferences,
      "notifyNewApplication" | "notifyNewMessage" | "notifyInterviewReminder" | "notifyWeeklySummary"
    >
  >,
): Promise<NotificationPreferences | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/employer/notification-preferences`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as NotificationPreferences & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}
