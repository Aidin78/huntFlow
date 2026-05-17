/** Allow only same-origin relative paths (no protocol-relative or external URLs). */
export function safeRedirectPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  return trimmed;
}
