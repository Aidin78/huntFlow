import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export type ContactFormInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
};

export type ContactFormResponse = {
  inquiry: { id: string; createdAt: string };
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

export async function submitContactForm(
  body: ContactFormInput,
): Promise<ContactFormResponse | ApiErrorBody> {
  const token = getAccessToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${getPublicApiBaseUrl()}/api/public/contact`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as ContactFormResponse & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}
