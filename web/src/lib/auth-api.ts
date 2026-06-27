import type { ApiErrorBody } from "@huntflow/contracts";

import { getPublicApiBaseUrl } from "./api-base";
import { getAccessToken } from "./auth-token";

import type { AppUserRole } from "./user-role";

export type { ApiErrorBody };

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: AppUserRole;
  createdAt: string;
};

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
  role: AppUserRole;
}): Promise<{ user: AuthUser; token: string } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as { user?: AuthUser; token?: string } & ApiErrorBody;
  if (!res.ok) {
    return data;
  }
  if (!data.user || !data.token) {
    return { error: { code: "INVALID_RESPONSE", message: "Unexpected response from server" } };
  }
  return { user: data.user, token: data.token };
}

export async function loginUser(input: {
  email: string;
  password: string;
  role: AppUserRole;
}): Promise<{ user: AuthUser; token: string } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as { user?: AuthUser; token?: string } & ApiErrorBody;
  if (!res.ok) {
    return data;
  }
  if (!data.user || !data.token) {
    return { error: { code: "INVALID_RESPONSE", message: "Unexpected response from server" } };
  }
  return { user: data.user, token: data.token };
}

export async function fetchMe(token: string): Promise<{ user: AuthUser } | ApiErrorBody> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as { user?: AuthUser } & ApiErrorBody;
  if (!res.ok) {
    return data;
  }
  if (!data.user) {
    return { error: { code: "INVALID_RESPONSE", message: "Unexpected response from server" } };
  }
  return { user: data.user };
}

export async function requestPasswordReset(email: string): Promise<ApiErrorBody | null> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  if (res.status === 204) return null;
  return (await res.json()) as ApiErrorBody;
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<ApiErrorBody | null> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (res.status === 204) return null;
  return (await res.json()) as ApiErrorBody;
}

export async function deleteAccount(password: string): Promise<ApiErrorBody | null> {
  const token = getAccessToken();
  if (!token) {
    return { error: { code: "UNAUTHORIZED", message: "Not signed in" } };
  }

  const res = await fetch(`${getPublicApiBaseUrl()}/api/auth/account`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  if (res.status === 204) return null;
  return (await res.json()) as ApiErrorBody;
}
