import { getPublicApiBaseUrl } from "./api-base";

import type { AppUserRole } from "./user-role";

export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

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
