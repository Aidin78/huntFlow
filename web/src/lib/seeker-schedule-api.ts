import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export type ReminderStatus = "PENDING" | "DONE" | "CANCELLED";

export type ApplicationInterview = {
  id: string;
  applicationId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationReminder = {
  id: string;
  applicationId: string;
  title: string;
  remindAt: string;
  status: ReminderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpcomingItem = {
  kind: "interview" | "reminder";
  id: string;
  applicationId: string;
  applicationTitle: string;
  companyName: string;
  title: string;
  at: string;
  isOverdue: boolean;
};

export type SeekerUpcomingResponse = {
  items: UpcomingItem[];
  interviewCount: number;
  reminderCount: number;
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchApplicationInterviews(
  applicationId: string,
): Promise<{ items: ApplicationInterview[] } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/interviews`,
    { headers: authHeaders(), cache: "no-store" },
  );
  const data = (await res.json()) as { items: ApplicationInterview[] } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export type CreateInterviewInput = {
  title: string;
  scheduledAt: string;
  durationMinutes?: number;
  location?: string;
  notes?: string;
};

export async function createInterview(
  applicationId: string,
  body: CreateInterviewInput,
): Promise<{ interview: ApplicationInterview } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/interviews`,
    {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = (await res.json()) as { interview: ApplicationInterview } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function updateInterview(
  applicationId: string,
  interviewId: string,
  patch: Partial<CreateInterviewInput> & { durationMinutes?: number | null; location?: string | null; notes?: string | null },
): Promise<{ interview: ApplicationInterview } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/interviews/${encodeURIComponent(interviewId)}`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
  );
  const data = (await res.json()) as { interview: ApplicationInterview } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function deleteInterview(applicationId: string, interviewId: string): Promise<ApiErrorBody | null> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/interviews/${encodeURIComponent(interviewId)}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (res.ok) return null;
  return (await res.json()) as ApiErrorBody;
}

export async function fetchApplicationReminders(
  applicationId: string,
): Promise<{ items: ApplicationReminder[] } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/reminders`,
    { headers: authHeaders(), cache: "no-store" },
  );
  const data = (await res.json()) as { items: ApplicationReminder[] } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export type CreateReminderInput = {
  title: string;
  remindAt: string;
  notes?: string;
};

export async function createReminder(
  applicationId: string,
  body: CreateReminderInput,
): Promise<{ reminder: ApplicationReminder } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/reminders`,
    {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = (await res.json()) as { reminder: ApplicationReminder } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function updateReminder(
  applicationId: string,
  reminderId: string,
  patch: Partial<CreateReminderInput> & { status?: ReminderStatus; notes?: string | null },
): Promise<{ reminder: ApplicationReminder } | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/reminders/${encodeURIComponent(reminderId)}`,
    {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
  );
  const data = (await res.json()) as { reminder: ApplicationReminder } & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function deleteReminder(applicationId: string, reminderId: string): Promise<ApiErrorBody | null> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/seeker/applications/${encodeURIComponent(applicationId)}/reminders/${encodeURIComponent(reminderId)}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (res.ok) return null;
  return (await res.json()) as ApiErrorBody;
}

export async function fetchSeekerUpcoming(
  limit = 10,
): Promise<SeekerUpcomingResponse | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/seeker/upcoming?limit=${limit}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = (await res.json()) as SeekerUpcomingResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export function formatScheduleDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}
