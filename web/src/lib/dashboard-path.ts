import type { AppUserRole } from "./user-role";

export function dashboardHomeForRole(role: AppUserRole): string {
  if (role === "PLATFORM_ADMIN") return "/dashboard/admin";
  return role === "EMPLOYER" ? "/dashboard/employer" : "/dashboard/seeker";
}
