/** Matches Prisma `UserRole` — use in API payloads and JWT-backed user objects. */
export type AppUserRole = "JOB_SEEKER" | "EMPLOYER";

/** URL query `?role=` uses lowercase slugs for readability. */
export function roleFromQuery(value: string | null): AppUserRole {
  const v = (value ?? "").toLowerCase();
  if (v === "employer" || v === "emp") return "EMPLOYER";
  return "JOB_SEEKER";
}

export function roleToQueryParam(role: AppUserRole): "job_seeker" | "employer" {
  return role === "EMPLOYER" ? "employer" : "job_seeker";
}

export function roleLabel(role: AppUserRole): string {
  return role === "EMPLOYER" ? "Employer" : "Job seeker";
}
