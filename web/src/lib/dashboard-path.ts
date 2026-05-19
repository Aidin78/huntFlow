import type { AppUserRole } from "./user-role";

export function dashboardHomeForRole(role: AppUserRole): string {
  return role === "EMPLOYER" ? "/dashboard/employer" : "/dashboard/seeker";
}
