import { getPublicApiBaseUrl } from '@/lib/api-base';

export type WorkArrangement = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type ExperienceLevel = 'INTERN' | 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';

export type JobListingCompany = {
  id: string;
  name: string;
  website?: string | null;
  linkedin?: string | null;
};

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
  company: JobListingCompany;
};

export type JobListingDetail = JobListingItem;

export type JobApplyStatus = {
  applied: boolean;
  application: { id: string; status: string; appliedAt: string | null } | null;
};

export type JobApplyResult = {
  alreadyApplied: boolean;
  application: { id: string; status: string; appliedAt: string | null; title?: string };
};

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
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

function readParam(
  sp: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const raw = sp instanceof URLSearchParams ? sp.get(key) : sp[key];
  if (typeof raw !== 'string') return undefined;
  const t = raw.trim();
  return t.length ? t : undefined;
}

export function jobListingsQueryFromSearchParams(
  sp: URLSearchParams | Record<string, string | string[] | undefined>,
): JobListingsQuery {
  const workArrangement = readParam(sp, 'workArrangement');
  const experience = readParam(sp, 'experience');

  const wa =
    workArrangement === 'REMOTE' || workArrangement === 'HYBRID' || workArrangement === 'ONSITE'
      ? workArrangement
      : undefined;
  const ex =
    experience === 'INTERN' ||
    experience === 'ENTRY' ||
    experience === 'MID' ||
    experience === 'SENIOR' ||
    experience === 'LEAD'
      ? experience
      : undefined;

  const q = readParam(sp, 'q');
  const job = readParam(sp, 'job');
  const city = readParam(sp, 'city');

  return {
    ...(q ? { q } : {}),
    ...(job ? { job } : {}),
    ...(city ? { city } : {}),
    ...(wa ? { workArrangement: wa } : {}),
    ...(ex ? { experience: ex } : {}),
  };
}

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

export async function fetchJobListing(id: string): Promise<JobListingDetail | null> {
  const res = await fetch(`${getPublicApiBaseUrl()}/api/job-listings/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Job listing request failed (${res.status})`);
  }
  const data = (await res.json()) as { item: JobListingDetail };
  return data.item;
}

export async function fetchJobApplyStatus(
  listingId: string,
  token: string,
): Promise<JobApplyStatus | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/job-listings/${encodeURIComponent(listingId)}/apply-status`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  const data = (await res.json()) as JobApplyStatus & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export async function applyToJobListing(
  listingId: string,
  token: string,
  options?: { coverLetter?: string },
): Promise<JobApplyResult | ApiErrorBody> {
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/job-listings/${encodeURIComponent(listingId)}/apply`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(options?.coverLetter ? { coverLetter: options.coverLetter } : {}),
      }),
    },
  );
  const data = (await res.json()) as JobApplyResult & ApiErrorBody;
  if (!res.ok) return data;
  return data;
}

export function formatPublishedDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
