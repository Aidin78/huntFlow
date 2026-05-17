/** Base URL for Express API routes (`/api/...`). */
export function getPublicApiBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  // Browser: same-origin `/api/*` via Next.js rewrite (see web/next.config.ts).
  if (typeof window !== "undefined") {
    return "";
  }

  // Server components / SSR: talk to API directly.
  const internal = process.env.API_URL?.trim() ?? process.env.INTERNAL_API_URL?.trim();
  if (internal) {
    return internal.replace(/\/+$/, "");
  }

  return "http://localhost:4000";
}
