import { getPublicApiBaseUrl } from "@/lib/api-base";

export type PublicHomeStats = {
  activeListings: number;
  hiringCompanies: number;
  workArrangements: string[];
};

export type PublicHomeJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  arrangement: string;
  publishedAt: string;
};

export type PublicHomeData = {
  stats: PublicHomeStats;
  featuredJobs: PublicHomeJob[];
};

export async function fetchPublicHome(limit = 3): Promise<PublicHomeData | null> {
  try {
    const res = await fetch(`${getPublicApiBaseUrl()}/api/public/home?limit=${limit}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicHomeData;
  } catch {
    return null;
  }
}

export function formatHomeStatLine(stats: PublicHomeStats): string {
  const parts: string[] = [];
  if (stats.activeListings > 0) {
    parts.push(
      `${stats.activeListings} open role${stats.activeListings === 1 ? "" : "s"}`,
    );
  }
  if (stats.hiringCompanies > 0) {
    parts.push(
      `${stats.hiringCompanies} compan${stats.hiringCompanies === 1 ? "y" : "ies"} hiring`,
    );
  }
  return parts.join(" · ");
}
