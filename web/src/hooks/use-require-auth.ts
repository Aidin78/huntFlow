"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { fetchMe, type AuthUser } from "@/lib/auth-api";
import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { dashboardHomeForRole } from "@/lib/dashboard-path";
import type { AppUserRole } from "@/lib/user-role";

type UseRequireAuthOptions = {
  requiredRole?: AppUserRole;
  loginPath?: string;
};

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const requiredRole = options.requiredRole;
  const loginPath = options.loginPath ?? "/login";

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      router.replace(loginPath);
      return;
    }

    let cancelled = false;
    (async () => {
      const result = await fetchMe(token);
      if (cancelled) return;

      if (!("user" in result) || !result.user) {
        clearAccessToken();
        setLoading(false);
        router.replace(loginPath);
        return;
      }

      if (requiredRole && result.user.role !== requiredRole) {
        setLoading(false);
        router.replace(dashboardHomeForRole(result.user.role));
        return;
      }

      setUser(result.user);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, loginPath, requiredRole]);

  return { user, loading };
}
