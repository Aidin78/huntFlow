import { getPublicApiBaseUrl } from '@/lib/api-base';

export type WorkArrangement = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type ExperienceLevel = 'INTERN' | 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';

export type JobListingItem = {
  id: string;
  title: string;
  summary: string | null;
  city: string | null;
  workArrangement: WorkArrangement;
  experienceLevel: ExperienceLevel;
  salaryText: string | null;
  sourceUrl: string | null;
  publishedAt: string;
  company: { id: string; name: string };
};

export type JobListingsFilters = {
  cities: string[];
  jobTitles: string[];
  workArrangements: WorkArrangement[];
  experienceLevels: ExperienceLevel[];
};

export type JobListingsResponse = {
  items: JobListingItem[];
  filters: JobListingsFilters;
};

export type JobListingsQuery = {
  q?: string;
  job?: string;
  city?: string;
  workArrangement?: WorkArrangement;
  experience?: ExperienceLevel;
};

export function workArrangementLabel(w: WorkArrangement): string {
  switch (w) {
    case 'REMOTE':
      return 'Remote';
    case 'HYBRID':
      return 'Hybrid';
    case 'ONSITE':
      return 'On-site';
    default:
      return w;
  }
}

export function experienceLabel(e: ExperienceLevel): string {
  switch (e) {
    case 'INTERN':
      return 'Intern';
    case 'ENTRY':
      return 'Entry level';
    case 'MID':
      return 'Mid level';
    case 'SENIOR':
      return 'Senior';
    case 'LEAD':
      return 'Lead / principal';
    default:
      return e;
  }
}

export async function fetchJobListings(query: JobListingsQuery): Promise<JobListingsResponse> {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.job) params.set('job', query.job);
  if (query.city) params.set('city', query.city);
  if (query.workArrangement) params.set('workArrangement', query.workArrangement);
  if (query.experience) params.set('experience', query.experience);

  const qs = params.toString();
  const url = `${getPublicApiBaseUrl()}/api/job-listings${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Job listings request failed (${res.status})`);
  }
  return res.json() as Promise<JobListingsResponse>;
}
