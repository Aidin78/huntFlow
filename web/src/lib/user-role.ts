/** Matches Prisma `UserRole` — use in API payloads and JWT-backed user objects. */
export type AppUserRole = "JOB_SEEKER" | "EMPLOYER" | "PLATFORM_ADMIN";

/** URL query `?role=` uses lowercase slugs for readability. */
export function roleFromQuery(value: string | null): AppUserRole {
  const v = (value ?? "").toLowerCase();
  if (v === "admin" || v === "platform_admin") return "PLATFORM_ADMIN";
  if (v === "employer" || v === "emp") return "EMPLOYER";
  return "JOB_SEEKER";
}

export function roleToQueryParam(role: AppUserRole): "job_seeker" | "employer" | "admin" {
  if (role === "PLATFORM_ADMIN") return "admin";
  return role === "EMPLOYER" ? "employer" : "job_seeker";
}

export function roleLabel(role: AppUserRole): string {
  if (role === "PLATFORM_ADMIN") return "Platform admin";
  return role === "EMPLOYER" ? "Employer" : "Job seeker";
}
