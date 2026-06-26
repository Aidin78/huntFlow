import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export type SeekerNotificationPreferences = {
  notifyNewApplication: boolean;
  notifyNewMessage: boolean;
  notifyInterviewReminder: boolean;
  notifyWeeklySummary: boolean;
  notifyStatusEvent: boolean;
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

export async function fetchSeekerNotificationPreferences(): Promise<
  SeekerNotificationPreferences | ApiErrorBody
> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/notification-preferences`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as SeekerNotificationPreferences & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function updateSeekerNotificationPreferences(
  patch: Partial<
    Pick<
      SeekerNotificationPreferences,
      "notifyNewMessage" | "notifyInterviewReminder" | "notifyStatusEvent"
    >
  >,
): Promise<SeekerNotificationPreferences | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/notification-preferences`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as SeekerNotificationPreferences & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}
